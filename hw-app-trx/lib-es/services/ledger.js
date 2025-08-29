var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { resolveTransaction } from "./contract";
import { getLoadConfig } from "./loadConfig";
import axios from "axios";
import { log } from "@ledgerhq/logs";
import { signatures as signaturesByChainId } from "@ledgerhq/cryptoassets/data/evm/index";
export const ledgerService = {
    resolveTransaction,
};
const asContractAddress = (addr) => {
    const a = addr.toLowerCase();
    return a.startsWith("0x") ? a : "0x" + a;
};
export const findTRC20SignaturesInfo = (userLoadConfig, chainId) => __awaiter(void 0, void 0, void 0, function* () {
    const { cryptoassetsBaseURL } = getLoadConfig(userLoadConfig);
    if (!cryptoassetsBaseURL)
        return null;
    const url = `${cryptoassetsBaseURL}/evm/${chainId}/erc20-signatures.json`;
    const blob = yield axios
        .get(url)
        .then(({ data }) => {
        if (!data || typeof data !== "string") {
            throw new Error(`TRC20 signatures for chainId ${chainId} file is malformed ${url}`);
        }
        return data;
    })
        .catch(e => {
        log("error", "could not fetch from " + url + ": " + String(e));
        return null;
    });
    return blob;
});
/**
 * Retrieve the token information by a given contract address if any
 */
export const byContractAddressAndChainId = (contract, chainId, erc20SignaturesBlob) => {
    var _a, _b;
    // If we are able to fetch data from s3 bucket that contains dynamic CAL
    if (erc20SignaturesBlob) {
        try {
            return parse(erc20SignaturesBlob).byContractAndChainId(asContractAddress(contract), chainId);
        }
        catch (e) {
            return (_a = get(chainId)) === null || _a === void 0 ? void 0 : _a.byContractAndChainId(asContractAddress(contract), chainId);
        }
    }
    // the static fallback when dynamic cal is not provided
    return (_b = get(chainId)) === null || _b === void 0 ? void 0 : _b.byContractAndChainId(asContractAddress(contract), chainId);
};
const parse = (trc20SignaturesBlob) => {
    // const buf = Buffer.from(trc20SignaturesBlob, "base64");
    // console.log(trc20SignaturesBlob);
    const buf = [
        {
            addr: "0x6b175474e89094c44da98b954eedeac495271d0f",
            ticker: "DAI",
            decimals: 18,
            chain_id: 1151668124,
            signature: [
                48, 69, 2, 33, 0, 170, 97, 122, 64, 108, 172, 119, 249, 179, 139, 88, 85, 228, 111, 31, 121,
                240, 244, 152, 70, 38, 106, 214, 182, 19, 153, 154, 226, 175, 33, 80, 95, 2, 32, 90, 18,
                131, 201, 33, 112, 67, 120, 111, 26, 68, 220, 240, 247, 26, 141, 181, 249, 68, 155, 57, 195,
                191, 248, 5, 140, 206, 54, 128, 53, 64, 4,
            ],
            data: [
                3, 68, 65, 73, 107, 23, 84, 116, 232, 144, 148, 196, 77, 169, 139, 149, 78, 237, 234, 196,
                149, 39, 29, 15, 0, 0, 0, 18, 68, 165, 15, 156, 48, 69, 2, 33, 0, 170, 97, 122, 64, 108,
                172, 119, 249, 179, 139, 88, 85, 228, 111, 31, 121, 240, 244, 152, 70, 38, 106, 214, 182,
                19, 153, 154, 226, 175, 33, 80, 95, 2, 32, 90, 18, 131, 201, 33, 112, 67, 120, 111, 26, 68,
                220, 240, 247, 26, 141, 181, 249, 68, 155, 57, 195, 191, 248, 5, 140, 206, 54, 128, 53, 64,
                4,
            ],
        },
        {
            addr: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            ticker: "WETH",
            decimals: 18,
            chain_id: 1151668124,
            signature: [
                48, 70, 2, 33, 0, 219, 44, 208, 22, 138, 41, 7, 234, 82, 20, 99, 228, 28, 12, 132, 9, 47,
                70, 134, 101, 113, 143, 98, 113, 225, 147, 61, 224, 174, 25, 44, 46, 2, 33, 0, 183, 60, 60,
                204, 195, 45, 36, 69, 172, 87, 205, 36, 23, 140, 138, 225, 206, 195, 232, 130, 200, 141, 85,
                36, 168, 81, 169, 255, 252, 195, 224, 62,
            ],
            data: [
                4, 87, 69, 84, 72, 192, 42, 170, 57, 178, 35, 254, 141, 10, 14, 92, 79, 39, 234, 217, 8, 60,
                117, 108, 194, 0, 0, 0, 18, 68, 165, 15, 156, 48, 70, 2, 33, 0, 219, 44, 208, 22, 138, 41,
                7, 234, 82, 20, 99, 228, 28, 12, 132, 9, 47, 70, 134, 101, 113, 143, 98, 113, 225, 147, 61,
                224, 174, 25, 44, 46, 2, 33, 0, 183, 60, 60, 204, 195, 45, 36, 69, 172, 87, 205, 36, 23,
                140, 138, 225, 206, 195, 232, 130, 200, 141, 85, 36, 168, 81, 169, 255, 252, 195, 224, 62,
            ],
        },
    ];
    const map = {};
    const entries = [];
    let i = 0;
    while (i < buf.length) {
        const ticker = buf[i].ticker;
        const contractAddress = buf[i].addr;
        const decimals = buf[i].decimals;
        const chainId = buf[i].chain_id;
        const signature = Buffer.from(buf[i].signature);
        // console.log(buf[i].chain_id);
        const entry = {
            ticker,
            contractAddress,
            decimals,
            chainId,
            signature,
            data: Buffer.from(buf[i].data),
        };
        entries.push(entry);
        map[String(chainId) + ":" + contractAddress] = entry;
        i++;
    }
    return {
        list: () => entries,
        byContractAndChainId: (contractAddress, chainId) => map[String(chainId) + ":" + contractAddress],
    };
};
// this internal get() will lazy load and cache the data from the erc20 data blob
const get = (() => {
    const cache = {};
    return chainId => {
        if (cache[chainId])
            return cache[chainId];
        const signatureBlob = signaturesByChainId[chainId];
        if (!signatureBlob)
            return null;
        const api = parse(signatureBlob);
        cache[chainId] = api;
        return api;
    };
})();
//# sourceMappingURL=ledger.js.map