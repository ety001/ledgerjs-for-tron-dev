"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppAndVersion = exports.TIP712_TYPE_ENCODERS = exports.hexBuffer = exports.padHexString = exports.getPayloadForFilterV2 = exports.getFilterDisplayNameAndSigBuffers = exports.makeTypeEntryStructBuffer = exports.constructTypeDescByteString = exports.intAsHexBytes = exports.TIP712_TYPE_PROPERTIES = exports.destructTypeFromString = exports.getValueFromPath = exports.getCoinRefTokensMap = exports.getFiltersForMessage = exports.getSchemaHashForMessage = exports.sortObjectAlphabetically = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const sha224_1 = __importDefault(require("crypto-js/sha224"));
const axios_1 = __importDefault(require("axios"));
const tip712_1 = __importDefault(require("./tip712"));
const constants_1 = require("@ethersproject/constants");
const sortObjectAlphabetically = (obj) => {
    const keys = Object.keys(obj).sort();
    return keys.reduce((acc, curr) => {
        const value = (() => {
            if (Array.isArray(obj[curr])) {
                return obj[curr].map(field => (0, exports.sortObjectAlphabetically)(field));
            }
            return obj[curr];
        })();
        acc[curr] = value;
        return acc;
    }, {});
};
exports.sortObjectAlphabetically = sortObjectAlphabetically;
const getSchemaHashForMessage = (message) => {
    const { types } = message;
    const sortedTypes = (0, exports.sortObjectAlphabetically)(types);
    return (0, sha224_1.default)(JSON.stringify(sortedTypes).replace(" ", "")).toString();
};
exports.getSchemaHashForMessage = getSchemaHashForMessage;
/**
 * Tries to find the proper filters for a given TIP712 message
 * in the CAL
 *
 * @param {TIP712Message} message
 * @returns {MessageFilters | undefined}
 */
const getFiltersForMessage = async (message, shouldUseV1Filters, calServiceURL) => {
    const schemaHash = (0, exports.getSchemaHashForMessage)(message);
    const verifyingContract = message.domain?.verifyingContract?.toLowerCase() || constants_1.AddressZero;
    try {
        if (calServiceURL) {
            const { data } = await axios_1.default.get(`${calServiceURL}/v1/dapps`, {
                params: {
                    output: "tip712_signatures",
                    eip712_signatures_version: shouldUseV1Filters ? "v1" : "v2",
                    chain_id: message.domain?.chainId || 0,
                    contracts: verifyingContract,
                },
            });
            // Rather than relying on array indices, find the right object wherever it may be, if it exists
            const targetObject = data.find(item => item?.tip712_signatures?.[verifyingContract]?.[schemaHash]);
            const filters = targetObject?.tip712_signatures?.[verifyingContract]?.[schemaHash];
            if (!filters) {
                // Fallback to catch
                throw new Error("Fallback to static file");
            }
            return filters;
        }
        // Fallback to catch
        throw new Error("Fallback to static file");
    }
    catch (e) {
        const messageId = `${message.domain?.chainId ?? 0}:${verifyingContract}:${schemaHash}`;
        return tip712_1.default[messageId];
    }
};
exports.getFiltersForMessage = getFiltersForMessage;
/**
 * @ignore for the README
 *
 * Creates a map for each token provided with a `provideERC20TokenInfo` APDU
 * in order to keep track of their index in the memory of the device
 *
 * @param {MessageFilters | undefined} filters
 * @param {boolean} shouldUseV1Filters
 * @param {TIP712Message} message
 * @returns {Record<number, { token: string; coinRefMemorySlot?: number }>}
 */
const getCoinRefTokensMap = (filters, shouldUseV1Filters, message) => {
    const coinRefsTokensMap = {};
    if (shouldUseV1Filters || !filters)
        return coinRefsTokensMap;
    const tokenFilters = filters.fields
        .filter(({ format }) => format === "token")
        .sort((a, b) => (a.coin_ref || 0) - (b.coin_ref || 0));
    const tokens = tokenFilters.reduce((acc, filter) => {
        const token = (0, exports.getValueFromPath)(filter.path, message);
        if (Array.isArray(token)) {
            throw new Error("Array of tokens is not supported with a single coin ref");
        }
        return [...acc, { token, coinRef: filter.coin_ref }];
    }, []);
    for (const { token, coinRef } of tokens) {
        coinRefsTokensMap[coinRef] = { token };
    }
    // For some messages like a Permit has no token address in its message, only the amount is provided.
    // In those cases, we'll need to provide the verifying contract contained in the TIP712 domain
    // The verifying contract is refrerenced by the coinRef 255 (0xff) in CAL and in the device
    // independently of the token index returned by the app after a providerERC20TokenInfo
    const shouldUseVerifyingContract = filters.fields.some(filter => filter.format === "amount" && filter.coin_ref === 255);
    if (shouldUseVerifyingContract && message.domain.verifyingContract) {
        coinRefsTokensMap[255] = { token: message.domain.verifyingContract };
    }
    return coinRefsTokensMap;
};
exports.getCoinRefTokensMap = getCoinRefTokensMap;
/**
 * Get the value at a specific path of an object and return it as a string or as an array of string
 * Used recursively by getValueFromPath
 *
 * @see getValueFromPath
 */
const getValue = (path, value) => {
    if (typeof value === "object") {
        if (Array.isArray(value)) {
            return value.map(v => getValue(path, v)).flat();
        }
        /* istanbul ignore if : unecessary test of a throw */
        if (!(path in value)) {
            throw new Error(`Could not find key ${path} in ${JSON.stringify(value)} `);
        }
        const result = value[path];
        return typeof result === "object" ? result : result.toString();
    }
    return value.toString();
};
/**
 * Using a path as a string, returns the value(s) of a json key without worrying about depth or arrays
 * (e.g: 'to.wallets.[]' => ["0x123", "0x456"])
 */
const getValueFromPath = (path, tip712Message) => {
    const splittedPath = path.split(".");
    const { message } = tip712Message;
    let value = message;
    for (let i = 0; i <= splittedPath.length - 1; i++) {
        const subPath = splittedPath[i];
        const isLastElement = i >= splittedPath.length - 1;
        if (subPath === "[]" && !isLastElement)
            continue;
        value = getValue(subPath, value);
    }
    /* istanbul ignore if : unecessary test of a throw */
    if (value === message) {
        throw new Error("getValueFromPath returned the whole original message");
    }
    return value;
};
exports.getValueFromPath = getValueFromPath;
/**
 * @ignore for the README
 *
 * Helper parsing an TIP712 Type name to return its type and size(s)
 * if it's an array or nested arrays
 *
 * @see TIP712MessageTypes
 *
 * @example "uint8[2][][4]" => [{name: "uint", bits: 8}, [2, null, 4]]
 * @example "bool" => [{name: "bool", bits: null}, []]
 *
 * @param {String} typeName
 * @returns {[{ name: string; bits: Number | null }, Array<Number | null | undefined>]}
 */
const destructTypeFromString = (typeName) => {
    // Will split "any[][1][10]" in "any", "[][1][10]"
    const splitNameAndArraysRegex = new RegExp(/^([^[\]]*)(\[.*\])*/g);
    // Will match all numbers (or null) inside each array. [0][10][] => [0,10,null]
    const splitArraysRegex = new RegExp(/\[(\d*)\]/g);
    // Will separate the the name from the potential bits/bytes allocation. uint8 => [uint,8]
    const splitNameAndNumberRegex = new RegExp(/(?=u?int|bytes)([a-zA-Z-0-9]+?)(\d{1,3})$/g);
    const [, type, maybeArrays] = splitNameAndArraysRegex.exec(typeName || "") || [];
    const [, name = type, size] = splitNameAndNumberRegex.exec(type || "") || [];
    const typeDescription = name ? { name, size: size ? Number(size) : undefined } : null;
    const arrays = maybeArrays ? [...maybeArrays.matchAll(splitArraysRegex)] : [];
    // Parse each size to either a Number or null
    const arrayLengths = arrays.map(([, arrayLength]) => (arrayLength ? Number(arrayLength) : null));
    return [typeDescription, arrayLengths];
};
exports.destructTypeFromString = destructTypeFromString;
/**
 * @ignore for the README
 *
 * A Map of helpers to get the id and size to return for each
 * type that can be used in TIP712
 */
exports.TIP712_TYPE_PROPERTIES = {
    CUSTOM: {
        key: () => 0,
        size: () => null,
    },
    INT: {
        key: () => 1,
        size: size => Number(size) / 8,
    },
    UINT: {
        key: () => 2,
        size: size => Number(size) / 8,
    },
    ADDRESS: {
        key: () => 3,
        size: () => null,
    },
    BOOL: {
        key: () => 4,
        size: () => null,
    },
    STRING: {
        key: () => 5,
        size: () => null,
    },
    BYTES: {
        key: size => (typeof size !== "undefined" ? 6 : 7),
        size: size => (typeof size !== "undefined" ? Number(size) : null),
    },
};
/**
 * @ignore for the README
 *
 * Helper to convert an integer as a hexadecimal string with the right amount of digits
 * to respect the number of bytes given as parameter
 *
 * @param int Integer
 * @param bytes Number of bytes it should be represented as (1 byte = 2 caraters)
 * @returns The given integer as an hexa string padded with the right number of 0
 */
const intAsHexBytes = (int, bytes) => int.toString(16).padStart(2 * bytes, "0");
exports.intAsHexBytes = intAsHexBytes;
/**
 * @ignore for the README
 *
 * Helper to construct the hexadecimal ByteString for the description
 * of a field in a TIP712 Message
 *
 * @param isArray
 * @param typeSize
 * @param typeValue
 * @returns {String} HexByteString
 */
const constructTypeDescByteString = (isArray, typeSize, typeValue) => {
    if (typeValue >= 16) {
        throw new Error("Tron utils - constructTypeDescByteString - Cannot accept a typeValue >= 16 because the typeValue can only be 4 bits in binary" +
            { isArray, typeSize, typeValue });
    }
    // 1 is array, 0 is not array
    const isArrayBit = isArray ? "1" : "0";
    // 1 has type size, 0 has no type size
    const hasTypeSize = typeof typeSize === "number" ? "1" : "0";
    // 2 unused bits
    const unusedBits = "00";
    // type key as 4 bits
    const typeValueBits = typeValue.toString(2).padStart(4, "0");
    return (0, exports.intAsHexBytes)(parseInt(isArrayBit + hasTypeSize + unusedBits + typeValueBits, 2), 1);
};
exports.constructTypeDescByteString = constructTypeDescByteString;
/**
 * @ignore for the README
 *
 * A Map of helpers to get the wanted binary value for
 * each type of array possible in a type definition
 */
var TIP712_ARRAY_TYPE_VALUE;
(function (TIP712_ARRAY_TYPE_VALUE) {
    TIP712_ARRAY_TYPE_VALUE[TIP712_ARRAY_TYPE_VALUE["DYNAMIC"] = 0] = "DYNAMIC";
    TIP712_ARRAY_TYPE_VALUE[TIP712_ARRAY_TYPE_VALUE["FIXED"] = 1] = "FIXED";
})(TIP712_ARRAY_TYPE_VALUE || (TIP712_ARRAY_TYPE_VALUE = {}));
/**
 * @ignore for the README
 *
 * Helper to create the buffer to describe an TIP712 types' entry structure
 *
 * @param {TIP712MessageTypesEntry} entry
 * @returns {Buffer}
 */
const makeTypeEntryStructBuffer = ({ name, type }) => {
    const [typeDescription, arrSizes] = (0, exports.destructTypeFromString)(type);
    const isTypeAnArray = Boolean(arrSizes.length);
    const typeProperties = exports.TIP712_TYPE_PROPERTIES[typeDescription?.name?.toUpperCase() || ""] ||
        exports.TIP712_TYPE_PROPERTIES.CUSTOM;
    const typeKey = typeProperties.key(typeDescription?.size);
    const typeSize = typeProperties.size(typeDescription?.size);
    const typeDescData = (0, exports.constructTypeDescByteString)(isTypeAnArray, typeSize, typeKey);
    const bufferArray = [Buffer.from(typeDescData, "hex")];
    if (typeProperties === exports.TIP712_TYPE_PROPERTIES.CUSTOM) {
        bufferArray.push(Buffer.from((0, exports.intAsHexBytes)(typeDescription?.name?.length ?? 0, 1), "hex"));
        bufferArray.push(Buffer.from(typeDescription?.name ?? "", "utf-8"));
    }
    if (typeof typeSize === "number") {
        bufferArray.push(Buffer.from((0, exports.intAsHexBytes)(typeSize, 1), "hex"));
    }
    if (isTypeAnArray) {
        bufferArray.push(Buffer.from((0, exports.intAsHexBytes)(arrSizes.length, 1), "hex"));
        arrSizes.forEach(size => {
            if (typeof size === "number") {
                bufferArray.push(Buffer.from((0, exports.intAsHexBytes)(TIP712_ARRAY_TYPE_VALUE.FIXED, 1), "hex"), Buffer.from((0, exports.intAsHexBytes)(size, 1), "hex"));
            }
            else {
                bufferArray.push(Buffer.from((0, exports.intAsHexBytes)(TIP712_ARRAY_TYPE_VALUE.DYNAMIC, 1), "hex"));
            }
        });
    }
    bufferArray.push(Buffer.from((0, exports.intAsHexBytes)(name.length, 1), "hex"), Buffer.from(name, "utf-8"));
    return Buffer.concat(bufferArray);
};
exports.makeTypeEntryStructBuffer = makeTypeEntryStructBuffer;
/**
 * @ignore for the README
 *
 * Helper creating the buffer representing the display name and signature
 * of a filter which are prefixes & suffixes of a all V2 payloads
 *
 * @param {string} displayName
 * @param {string} sig
 * @returns {{ displayNameBuffer: Buffer; sigBuffer: Buffer }}
 */
const getFilterDisplayNameAndSigBuffers = (displayName, sig) => {
    const displayNameContentBuffer = Buffer.from(displayName);
    const displayNameLengthBuffer = Buffer.from((0, exports.intAsHexBytes)(displayNameContentBuffer.length, 1), "hex");
    const sigContentBuffer = Buffer.from(sig, "hex");
    const sigLengthBuffer = Buffer.from((0, exports.intAsHexBytes)(sigContentBuffer.length, 1), "hex");
    return {
        displayNameBuffer: Buffer.concat([displayNameLengthBuffer, displayNameContentBuffer]),
        sigBuffer: Buffer.concat([sigLengthBuffer, sigContentBuffer]),
    };
};
exports.getFilterDisplayNameAndSigBuffers = getFilterDisplayNameAndSigBuffers;
/**
 * @ignore for the README
 *
 * Creates the payload for V2 filters following the spec provided here:
 *
 * @see https://github.com/LedgerHQ/app-ethereum/blob/develop/doc/ethapp.adoc#if-p2--message-info
 *
 * @param {FilteringInfoShowField["format"]} format
 * @param {FilteringInfoShowField["coinRef"]} coinRef
 * @param {FilteringInfoShowField["coinRefsTokensMap"]} coinRefsTokensMap
 * @param {Buffer} displayNameBuffer
 * @param {Buffer} sigBuffer
 * @returns {Buffer}
 */
const getPayloadForFilterV2 = (format, coinRef, coinRefsTokensMap, displayNameBuffer, sigBuffer) => {
    switch (format) {
        case "raw":
        case "datetime":
            return Buffer.concat([displayNameBuffer, sigBuffer]);
        case "token": {
            const { deviceTokenIndex } = coinRefsTokensMap[coinRef];
            return Buffer.concat([
                Buffer.from((0, exports.intAsHexBytes)(deviceTokenIndex || coinRef || 0, 1), "hex"),
                sigBuffer,
            ]);
        }
        case "amount": {
            const { deviceTokenIndex } = coinRefsTokensMap[coinRef];
            return Buffer.concat([
                displayNameBuffer,
                Buffer.from((0, exports.intAsHexBytes)(deviceTokenIndex || coinRef || 0, 1), "hex"),
                sigBuffer,
            ]);
        }
        default:
            throw new Error("Invalid format");
    }
};
exports.getPayloadForFilterV2 = getPayloadForFilterV2;
const padHexString = (str) => {
    return str.length % 2 ? "0" + str : str;
};
exports.padHexString = padHexString;
function hexBuffer(str) {
    if (!str)
        return Buffer.alloc(0);
    const strWithoutPrefix = str.startsWith("0x") ? str.slice(2) : str;
    return Buffer.from((0, exports.padHexString)(strWithoutPrefix), "hex");
}
exports.hexBuffer = hexBuffer;
/**
 * @ignore for the README
 *
 * A Map of encoders to transform a value to formatted buffer
 */
exports.TIP712_TYPE_ENCODERS = {
    INT(value, size = 256) {
        const failSafeValue = value ?? "0";
        if (typeof failSafeValue === "string" && failSafeValue?.startsWith("0x")) {
            return hexBuffer(failSafeValue);
        }
        let valueAsBN = new bignumber_js_1.default(failSafeValue);
        // If negative we'll use `two's complement` method to
        // "reversibly convert a positive binary number into a negative binary number with equivalent (but negative) value".
        // thx wikipedia
        if (valueAsBN.lt(0)) {
            const sizeInBytes = size / 8;
            // Creates BN from a buffer serving as a mask filled by maximum value 0xff
            const maskAsBN = new bignumber_js_1.default(`0x${Buffer.alloc(sizeInBytes, 0xff).toString("hex")}`);
            // two's complement version of value
            valueAsBN = maskAsBN.plus(valueAsBN).plus(1);
        }
        const paddedHexString = valueAsBN.toString(16).length % 2 ? "0" + valueAsBN.toString(16) : valueAsBN.toString(16);
        return Buffer.from(paddedHexString, "hex");
    },
    UINT(value) {
        return this.INT(value);
    },
    BOOL(value) {
        return this.INT(typeof value === "boolean" ? Number(value).toString() : value);
    },
    ADDRESS(value) {
        // Only sending the first 10 bytes (why ?)
        return hexBuffer(value ?? "").slice(0, 20);
    },
    STRING(value) {
        return Buffer.from(value ?? "", "utf-8");
    },
    BYTES(value, size) {
        const failSafeValue = value ?? "";
        // Why slice again ?
        return hexBuffer(failSafeValue).slice(0, size ?? (failSafeValue?.length - 2) / 2);
    },
};
/**
 * @ignore for the README
 *
 * Get the current application name loaded in Bolos and its version
 *
 * @param {Transport} transport
 * @returns {Promise<{name: string, version: string}>}
 */
const getAppAndVersion = async (transport) => {
    const appAndVersionHex = await transport.send(0xb0, 0x01, 0x00, 0x00);
    let offset = 1;
    const nameLength = appAndVersionHex[offset];
    offset += 1;
    const name = appAndVersionHex.subarray(offset, offset + nameLength).toString("ascii");
    offset += nameLength;
    const versionLength = appAndVersionHex[offset];
    offset += 1;
    const version = appAndVersionHex.subarray(offset, offset + versionLength).toString("ascii");
    return {
        name,
        version,
    };
};
exports.getAppAndVersion = getAppAndVersion;
//# sourceMappingURL=utils.js.map