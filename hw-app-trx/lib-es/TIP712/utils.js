var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ethers } from "ethers";
import SHA224 from "crypto-js/sha224";
import { BigNumber } from "bignumber.js";
import EIP712CALV2 from "@ledgerhq/cryptoassets/data/eip712_v2";
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
export const intAsHexBytes = (int, bytes) => int.toString(16).padStart(2 * bytes, "0");
export const padHexString = (str) => {
    return str.length % 2 ? "0" + str : str;
};
export function hexBuffer(str) {
    const strWithoutPrefix = str.startsWith("0x") ? str.slice(2) : str;
    return Buffer.from(padHexString(strWithoutPrefix), "hex");
}
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
 * A Map of helpers to get the id and size to return for each
 * type that can be used in EIP712
 */
export const TIP712_TYPE_PROPERTIES = {
    CUSTOM: {
        key: () => 0,
        sizeInBits: () => null,
    },
    INT: {
        key: () => 1,
        sizeInBits: size => Number(size) / 8,
    },
    UINT: {
        key: () => 2,
        sizeInBits: size => Number(size) / 8,
    },
    ADDRESS: {
        key: () => 3,
        sizeInBits: () => null,
    },
    BOOL: {
        key: () => 4,
        sizeInBits: () => null,
    },
    STRING: {
        key: () => 5,
        sizeInBits: () => null,
    },
    BYTES: {
        key: size => (typeof size !== "undefined" ? 6 : 7),
        sizeInBits: size => (typeof size !== "undefined" ? Number(size) : null),
    },
};
/**
 * @ignore for the README
 *
 * A Map of encoders to transform a value to formatted buffer
 */
export const TIP712_TYPE_ENCODERS = {
    INT(value, sizeInBits = 256) {
        const failSafeValue = value !== null && value !== void 0 ? value : "0";
        if (typeof failSafeValue === "string" && (failSafeValue === null || failSafeValue === void 0 ? void 0 : failSafeValue.startsWith("0x"))) {
            return hexBuffer(failSafeValue);
        }
        let valueAsBN = new BigNumber(failSafeValue);
        // If negative we'll use `two's complement` method to
        // "reversibly convert a positive binary number into a negative binary number with equivalent (but negative) value".
        // thx wikipedia
        if (valueAsBN.lt(0)) {
            const sizeInBytes = sizeInBits / 8;
            // Creates BN from a buffer serving as a mask filled by maximum value 0xff
            const maskAsBN = new BigNumber(`0x${Buffer.alloc(sizeInBytes, 0xff).toString("hex")}`);
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
        return hexBuffer(value !== null && value !== void 0 ? value : "").slice(0, 20);
    },
    STRING(value) {
        return Buffer.from(value !== null && value !== void 0 ? value : "", "utf-8");
    },
    BYTES(value, sizeInBits) {
        const failSafeValue = value !== null && value !== void 0 ? value : "";
        // Why slice again ?
        return hexBuffer(failSafeValue).slice(0, sizeInBits !== null && sizeInBits !== void 0 ? sizeInBits : ((failSafeValue === null || failSafeValue === void 0 ? void 0 : failSafeValue.length) - 2) / 2);
    },
};
/* export const sortObjectAlphabetically = (obj) => {
  const keys = Object.keys(obj).sort();

  return keys.reduce((acc, curr) => {
    const value = (() => {
      if (Array.isArray(obj[curr])) {
        return obj[curr]
          .map(field => sortObjectAlphabetically(field))
          .sort((a, b) => {
            if (a && b && typeof a === 'object' && typeof b === 'object') {
              return String(a.name).localeCompare(String(b.name));
            }
            return 0;
          });
      }

      return obj[curr];
    })();

    acc[curr] = value;
    return acc;
  }, {});
}; */

export const sortObjectAlphabetically = (obj) => {
  return obj;
};

export const getSchemaHashForMessage = (message) => {
    const { types } = message;
    const sortedTypes = sortObjectAlphabetically(types);
    return SHA224(JSON.stringify(sortedTypes).replace(" ", "")).toString();
};
/**
 * Tries to find the proper filters for a given EIP712 message
 * in the CAL
 *
 * @param {EIP712Message} message
 * @returns {MessageFilters | undefined}
 */
export const getFiltersForMessage = (message, shouldUseV1Filters, calServiceURL) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const schemaHash = getSchemaHashForMessage(message);
    const verifyingContract = ((_b = (_a = message.domain) === null || _a === void 0 ? void 0 : _a.verifyingContract) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || ethers.constants.AddressZero;
    try {
        if (calServiceURL) {
            // const { data } = await axios.get<CALServiceTIP712Response>(`${calServiceURL}/v1/dapps`, {
            //   params: {
            //     output: "tip712_signatures",
            //     eip712_signatures_version: shouldUseV1Filters ? "v1" : "v2",
            //     chain_id: message.domain?.chainId,
            //     contracts: verifyingContract,
            //   },
            // });
            /* const data = [
                {
                eip712_signatures: {
                    "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC": {
                    "3168f19a558603d50796e8a54bef73db90af3ea57c2e133c5da24344": {
                        contractName: {
                        label: "Advanced Filtering",
                        signature:
                            "3045022100e0e774e6066f89d82b7b4d60cc0abee0aa934bc3a6d67dbcf35cb781797ad0c1022073f3f70f1a880770a107c919bae021921441932c7bfe657b4035edddbb613c70",
                        },
                        fields: [
                        {
                            coin_ref: 0,
                            format: "amount",
                            label: "Send",
                            path: "value_send",
                            signature:
                            "304602210093bad08be8267138e904384cee915937d6c263589cfbf5ba08ff6d2e85801969022100d8c4eb908b4c52adbbc6ea914cf6a725fee1075b06622aafb9bc206d4f3adc16",
                        },
                        {
                            coin_ref: 0,
                            format: "token",
                            path: "token_send",
                            signature:
                            "3046022100dccc5dffad16fd0a35a227cb3dacc3c997301612a1d3ce8ab32dada30f0b31ac022100f9e65b461a53a993b2eee552c26292633aa719a37de24ab4224f7d8cf265c531",
                        },
                        {
                            coin_ref: 1,
                            format: "amount",
                            label: "Receive",
                            path: "value_recv",
                            signature:
                            "304502207e0d7b2513cb223f18fd2739fbb1e103931d6f4e070216f05538e4f388091747022100ef325e08930c5470da66bd25814e3fa4aa1a19443b16fd9ce7cbde7e37bc7e27",
                        },
                        {
                            coin_ref: 1,
                            format: "token",
                            path: "token_recv",
                            signature:
                            "30450221008220edb0a41b8c017fa096950ecf4dfa298af72e5d5bf1aa9b7974d9cc86f8ed022003bfcc91969b7c2525295ee5cef1763814039246e850176ca8c7dd1a05488425",
                        },
                        {
                            format: "raw",
                            label: "With",
                            path: "with",
                            signature:
                            "304502207f7dbbb58bba9937e5cbdeb7a97c575cc59bbc00babb20273bbfa98ecd3b9f2e022100d04f3c3efefa791a1a4bbeb925cdd3c637671c08bc19e35c02f838c3c040f47d",
                        },
                        {
                            format: "datetime",
                            label: "Will Expire",
                            path: "expires",
                            signature:
                            "304402202bbd9ab351e1da80a61a83c97235250bfbe07c8d0fae1f357a49840cfe26d8fb02206232be61250c287cfe2682cfb48a709ae46102c325169149009ffb0d87df6b4e",
                        },
                        ],
                    },
                    },
                },
                },
            ];
            const filters = (_e = (_d = (_c = data === null || data === void 0 ? void 0 : data[0]) === null || _c === void 0 ? void 0 : _c.eip712_signatures) === null || _d === void 0 ? void 0 : _d["0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"]) === null || _e === void 0 ? void 0 : _e["3168f19a558603d50796e8a54bef73db90af3ea57c2e133c5da24344"]; */
            const data = [
            {
                "eip712_signatures": {
                    "0xcccccccccccccccccccccccccccccccccccccccc": {
                    "7b27696c38b689d577ce71af0ccab01cb4334a33278b5dc4556f0834": {
                        "contractName": {
                        "label": "Advanced Filtering",
                        "signature": "3045022100e0e774e6066f89d82b7b4d60cc0abee0aa934bc3a6d67dbcf35cb781797ad0c1022073f3f70f1a880770a107c919bae021921441932c7bfe657b4035edddbb613c70"
                        },
                        "fields": [
                        {
                            "path": "with",
                            "format": "raw",
                            "label": "With",
                            "signature": "304502207f7dbbb58bba9937e5cbdeb7a97c575cc59bbc00babb20273bbfa98ecd3b9f2e022100d04f3c3efefa791a1a4bbeb925cdd3c637671c08bc19e35c02f838c3c040f47d"
                        },
                        {
                            "path": "value_recv",
                            "format": "amount",
                            "coin_ref": 0,
                            "label": "Receive",
                            "signature": "304502207e0d7b2513cb223f18fd2739fbb1e103931d6f4e070216f05538e4f388091747022100ef325e08930c5470da66bd25814e3fa4aa1a19443b16fd9ce7cbde7e37bc7e27"
                        },
                        {
                            "format": "token",
                            "path": "token_send",
                            "coin_ref": 1,
                            "signature": "3045022100aa617a406cac77f9b38b5855e46f1f79f0f49846266ad6b613999ae2af21505f02205a1283c9217043786f1a44dcf0f71a8db5f9449b39c3bff8058cce3680354004"
                        },
                        {
                            "path": "token_send",
                            "format": "amount",
                            "coin_ref": 1,
                            "signature": "30450221008220edb0a41b8c017fa096950ecf4dfa298af72e5d5bf1aa9b7974d9cc86f8ed022003bfcc91969b7c2525295ee5cef1763814039246e850176ca8c7dd1a05488425"
                        },
                        {
                            "path": "value_send",
                            "format": "amount",
                            "coin_ref": 1,
                            "label": "Send",
                            "signature": "304602210093bad08be8267138e904384cee915937d6c263589cfbf5ba08ff6d2e85801969022100d8c4eb908b4c52adbbc6ea914cf6a725fee1075b06622aafb9bc206d4f3adc16"
                        },
                        {
                            "format": "token",
                            "path": "token_recv",
                            "coin_ref": 0,
                            "signature": "3046022100db2cd0168a2907ea521463e41c0c84092f468665718f6271e1933de0ae192c2e022100b73c3cccc32d2445ac57cd24178c8ae1cec3e882c88d5524a851a9fffcc3e03e"
                        },
                        {
                            "path": "token_recv",
                            "format": "amount",
                            "coin_ref": 0,
                            "signature": "3046022100dccc5dffad16fd0a35a227cb3dacc3c997301612a1d3ce8ab32dada30f0b31ac022100f9e65b461a53a993b2eee552c26292633aa719a37de24ab4224f7d8cf265c531"
                        },
                        {
                            "path": "expires",
                            "format": "datetime",
                            "label": "Will Expire",
                            "signature": "304402202bbd9ab351e1da80a61a83c97235250bfbe07c8d0fae1f357a49840cfe26d8fb02206232be61250c287cfe2682cfb48a709ae46102c325169149009ffb0d87df6b4e"
                        }
                        ]
                    }
                    }
                }
                }
            ];
            const filters = (_e = (_d = (_c = data === null || data === void 0 ? void 0 : data[0]) === null || _c === void 0 ? void 0 : _c.eip712_signatures) === null || _d === void 0 ? void 0 : _d["0xcccccccccccccccccccccccccccccccccccccccc"]) === null || _e === void 0 ? void 0 : _e["7b27696c38b689d577ce71af0ccab01cb4334a33278b5dc4556f0834"]; 
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
        const messageId = `${(_g = (_f = message.domain) === null || _f === void 0 ? void 0 : _f.chainId) !== null && _g !== void 0 ? _g : 0}:${verifyingContract}:${schemaHash}`;
        return EIP712CALV2[messageId];
    }
});
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
export const getValueFromPath = (path, tip721Message) => {
    const splittedPath = path.split(".");
    const { message } = tip721Message;
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
/**
 * @ignore for the README
 *
 * Helper parsing an EIP712 Type name to return its type and size(s)
 * if it's an array or nested arrays
 *
 * @see EIP712MessageTypes
 *
 * @example "uint8[2][][4]" => [{name: "uint", bits: 8}, [2, null, 4]]
 * @example "bool" => [{name: "bool", bits: null}, []]
 *
 * @param {String} typeName
 * @returns {[{ name: string; bits: Number | null }, Array<Number | null | undefined>]}
 */
export const destructTypeFromString = (typeName) => {
    // Will split "any[][1][10]" in "any", "[][1][10]"
    const splitNameAndArraysRegex = new RegExp(/^([^[\]]*)(\[.*\])*/g);
    // Will match all numbers (or null) inside each array. [0][10][] => [0,10,null]
    const splitArraysRegex = new RegExp(/\[(\d*)\]/g);
    // Will separate the the name from the potential bits allocation. uint8 => [uint,8]
    const splitNameAndNumberRegex = new RegExp(/(\D*)(\d*)/);
    const [, type, maybeArrays] = splitNameAndArraysRegex.exec(typeName || "") || [];
    const [, name, bits] = splitNameAndNumberRegex.exec(type || "") || [];
    const typeDescription = name ? { name, bits: bits ? Number(bits) : undefined } : null;
    const arrays = maybeArrays ? [...maybeArrays.matchAll(splitArraysRegex)] : [];
    // Parse each size to either a Number or null
    const arraySizes = arrays.map(([, size]) => (size ? Number(size) : null));
    return [typeDescription, arraySizes];
};
/**
 * @ignore for the README
 *
 * Helper to construct the hexadecimal ByteString for the description
 * of a field in an EIP712 Message
 *
 * @param isArray
 * @param typeSize
 * @param typeValue
 * @returns {String} HexByteString
 */
export const constructTypeDescByteString = (isArray, typeSize, typeValue) => {
    if (typeValue >= 16) {
        throw new Error("Eth utils - constructTypeDescByteString - Cannot accept a typeValue >= 16 because the typeValue can only be 4 bits in binary" +
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
    return intAsHexBytes(parseInt(isArrayBit + hasTypeSize + unusedBits + typeValueBits, 2), 1);
};
/**
 * @ignore for the README
 *
 * Helper to create the buffer to describe an EIP712 types' entry structure
 *
 * @param {EIP712MessageTypesEntry} entry
 * @returns {Buffer}
 */
export const makeTypeEntryStructBuffer = ({ name, type }) => {
    var _a, _b, _c, _d;
    const [typeDescription, arrSizes] = destructTypeFromString(type);
    const isTypeAnArray = Boolean(arrSizes.length);
    const typeProperties = TIP712_TYPE_PROPERTIES[((_a = typeDescription === null || typeDescription === void 0 ? void 0 : typeDescription.name) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || ""] ||
        TIP712_TYPE_PROPERTIES.CUSTOM;
    const typeKey = typeProperties.key(typeDescription === null || typeDescription === void 0 ? void 0 : typeDescription.bits);
    const typeSizeInBits = typeProperties.sizeInBits(typeDescription === null || typeDescription === void 0 ? void 0 : typeDescription.bits);
    const typeDescData = constructTypeDescByteString(isTypeAnArray, typeSizeInBits, typeKey);
    const bufferArray = [Buffer.from(typeDescData, "hex")];
    if (typeProperties === TIP712_TYPE_PROPERTIES.CUSTOM) {
        bufferArray.push(Buffer.from(intAsHexBytes((_c = (_b = typeDescription === null || typeDescription === void 0 ? void 0 : typeDescription.name) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0, 1), "hex"));
        bufferArray.push(Buffer.from((_d = typeDescription === null || typeDescription === void 0 ? void 0 : typeDescription.name) !== null && _d !== void 0 ? _d : "", "utf-8"));
    }
    if (typeof typeSizeInBits === "number") {
        bufferArray.push(Buffer.from(intAsHexBytes(typeSizeInBits, 1), "hex"));
    }
    if (isTypeAnArray) {
        bufferArray.push(Buffer.from(intAsHexBytes(arrSizes.length, 1), "hex"));
        arrSizes.forEach(size => {
            if (typeof size === "number") {
                bufferArray.push(Buffer.from(intAsHexBytes(TIP712_ARRAY_TYPE_VALUE.FIXED, 1), "hex"), Buffer.from(intAsHexBytes(size, 1), "hex"));
            }
            else {
                bufferArray.push(Buffer.from(intAsHexBytes(TIP712_ARRAY_TYPE_VALUE.DYNAMIC, 1), "hex"));
            }
        });
    }
    bufferArray.push(Buffer.from(intAsHexBytes(name.length, 1), "hex"), Buffer.from(name, "utf-8"));
    return Buffer.concat(bufferArray);
};
/**
 * @ignore for the README
 *
 * Creates a map for each token provided with a `provideERC20TokenInfo` APDU
 * in order to keep track of their index in the memory of the device
 *
 * @param {MessageFilters | undefined} filters
 * @param {boolean} shouldUseV1Filters
 * @param {EIP712Message} message
 * @returns {Record<number, { token: string; coinRefMemorySlot?: number }>}
 */
export const getCoinRefTokensMap = (filters, shouldUseV1Filters, message) => {
    const coinRefsTokensMap = {};
    if (shouldUseV1Filters || !filters)
        return coinRefsTokensMap;
    const tokenFilters = filters.fields
    .filter(({ format }) => format === "token")
    .sort((a, b) => (a.coin_ref || 0) - (b.coin_ref || 0));
    console.log("ZYD tokenFilters:", tokenFilters);
    console.log("ZYD message:", message);
    const tokens = tokenFilters.reduce((acc, filter) => {
        console.log("ZYD filter.path:", filter.path);
        const token = getValueFromPath(filter.path, message);
        if (Array.isArray(token)) {
            throw new Error("Array of tokens is not supported with a single coin ref");
        }
        return [...acc, { token, coinRef: filter.coin_ref }];
    }, []);
    for (const { token, coinRef } of tokens) {
        coinRefsTokensMap[coinRef] = { token };
    }
    // For some messages like a Permit has no token address in its message, only the amount is provided.
    // In those cases, we'll need to provide the verifying contract contained in the EIP712 domain
    // The verifying contract is refrerenced by the coinRef 255 (0xff) in CAL and in the device
    // independently of the token index returned by the app after a providerERC20TokenInfo
    const shouldUseVerifyingContract = filters.fields.some(filter => filter.format === "amount" && filter.coin_ref === 255);
    if (shouldUseVerifyingContract && message.domain.verifyingContract) {
        coinRefsTokensMap[255] = { token: message.domain.verifyingContract };
    }
    return coinRefsTokensMap;
};
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
export const getFilterDisplayNameAndSigBuffers = (displayName, sig) => {
    const displayNameContentBuffer = Buffer.from(displayName);
    const displayNameLengthBuffer = Buffer.from(intAsHexBytes(displayNameContentBuffer.length, 1), "hex");
    const sigContentBuffer = Buffer.from(sig, "hex");
    const sigLengthBuffer = Buffer.from(intAsHexBytes(sigContentBuffer.length, 1), "hex");
    return {
        displayNameBuffer: Buffer.concat([displayNameLengthBuffer, displayNameContentBuffer]),
        sigBuffer: Buffer.concat([sigLengthBuffer, sigContentBuffer]),
    };
};
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
export const getPayloadForFilterV2 = (format, coinRef, coinRefsTokensMap, displayNameBuffer, sigBuffer) => {
    switch (format) {
        case "raw":
        case "datetime":
            return Buffer.concat([displayNameBuffer, sigBuffer]);
        case "token": {
            const { deviceTokenIndex } = coinRefsTokensMap[coinRef];
            return Buffer.concat([
                Buffer.from(intAsHexBytes(deviceTokenIndex || coinRef || 0, 1), "hex"),
                sigBuffer,
            ]);
        }
        case "amount": {
            const { deviceTokenIndex } = coinRefsTokensMap[coinRef];
            return Buffer.concat([
                displayNameBuffer,
                Buffer.from(intAsHexBytes(/* deviceTokenIndex ||  */coinRef || 0, 1), "hex"),
                sigBuffer,
            ]);
        }
        default:
            throw new Error("Invalid format");
    }
};
//# sourceMappingURL=utils.js.map