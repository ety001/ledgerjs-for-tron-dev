var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bs58 from "bs58check";
import axios from "axios";
import { TriggerSmartContract } from "../protobuf/smart_contract_pb";
import { Transaction } from "../protobuf/Tron_pb";
/**
 * Resolve resolution of transction for clear sign. The result is `null` if transaction is not TriggerSmartContract or no resolution found.
 * @param rawDataHex raw_data_hex in transaction
 * @param loadConfig config for load transaction plugin info
 * @param loadConfig.pluginBaseURL base url to fetch plugin info
 * @param loadConfig.extraPlugins plugin info to be merged with plugin info from service. Useful for debug.
 * @returns resolution for clear sign
 */
export function resolveTransaction(rawDataHex_1) {
    return __awaiter(this, arguments, void 0, function* (rawDataHex, loadConfig = {}, resolutionConfig) {
        const contractInfo = deserializeContractInfoFromHex(rawDataHex);
        if (!contractInfo) {
            return null;
        }
        const resolution = { externalPlugin: [] };
        const { contractAddress, selector } = contractInfo;
        if (resolutionConfig.externalPlugins) {
            const contractMethodInfos = yield getPluginInfoForContractMethod(contractAddress, selector, loadConfig);
            if (contractMethodInfos) {
                const { payload, signature, plugin } = contractMethodInfos;
                if (plugin) {
                    console.log("tron", `found plugin (${plugin}) for selector: ${selector}`);
                    resolution.externalPlugin.push({ payload, signature });
                }
            }
            else {
                console.log("tron", "no infos for selector " + selector);
            }
        }
        return resolution;
    });
}
/**
 * Get plugin info of the given contract address and function for clear sign. The result is `undefined` if transaction is not TriggerSmartContract or no resolution found.
 * @param contractAddress contract address in TriggerSmartContract transaction
 * @param selector function selector in TriggerSmartContract transaction
 * @param loadConfig config for load transaction plugin info
 * @param loadConfig.pluginBaseURL base url to fetch plugin info
 * @param loadConfig.extraPlugins plugin info to be merged with plugin info from service. Useful for debug.
 * @returns plugin info with payload and signature if exists.
 */
export function getPluginInfoForContractMethod(contractAddress_1, selector_1) {
    return __awaiter(this, arguments, void 0, function* (contractAddress, selector, userLoadConfig = {}) {
        const { pluginBaseURL, extraPlugins } = Object.assign({ pluginBaseURL: "https://cdn.live.ledger.com", extraPlugins: null }, userLoadConfig);
        let data = {};
        if (pluginBaseURL) {
            const url = `${pluginBaseURL}/plugins/tron.json`;
            data = yield axios
                .get(url)
                .then(r => r.data)
                .catch(e => {
                console.error(`[hw-app-trx]: could not fetch plugins from ${url}: ${String(e)}`);
                return undefined;
            });
        }
        if (extraPlugins) {
            data = Object.assign(Object.assign({}, data), extraPlugins);
        }
        if (!data)
            return;
        const lcSelector = selector.toLowerCase();
        const contractSelectors = data[contractAddress];
        if (contractSelectors) {
            const plugin = contractSelectors[lcSelector];
            if (plugin) {
                return {
                    payload: plugin["serialized_data"],
                    signature: plugin["signature"],
                    plugin: plugin["plugin"],
                };
            }
        }
    });
}
const TriggerSmartContractType = 31;
/**
 * Deserialize contract raw data to get contract address and function selector.
 * @param rawTx raw data in hex
 * @returns contractAddress and function selector
 */
export function deserializeContractInfoFromHex(rawTx) {
    var _a;
    try {
        const transaction = Transaction.raw.deserializeBinary(Uint8Array.from(Buffer.from(rawTx, "hex")));
        const contract = (_a = transaction.getContractList()) === null || _a === void 0 ? void 0 : _a[0];
        if (!contract) {
            return;
        }
        const type = contract.getType();
        if (type !== TriggerSmartContractType) {
            return;
        }
        const value = contract.getParameter().getValue();
        const smartContract = TriggerSmartContract.deserializeBinary(value);
        const contractAddress = bs58.encode(smartContract.getContractAddress());
        const data = Buffer.from(smartContract.getData()).toString("hex");
        const selector = "0x" + data.slice(0, 8).toLowerCase();
        return { contractAddress, selector };
    }
    catch (e) {
        console.error(`[hw-app-trx]: failed to deserialize transaction from hex: ${String(e)}`);
    }
}
//# sourceMappingURL=contract.js.map