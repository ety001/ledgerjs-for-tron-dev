import { LedgerTrxTransactionResolution, LoadConfig, ResolutionConfig } from "./types";
type ContractMethod = {
    payload: string;
    signature: string;
    plugin: string;
};
/**
 * Resolve resolution of transction for clear sign. The result is `null` if transaction is not TriggerSmartContract or no resolution found.
 * @param rawDataHex raw_data_hex in transaction
 * @param loadConfig config for load transaction plugin info
 * @param loadConfig.pluginBaseURL base url to fetch plugin info
 * @param loadConfig.extraPlugins plugin info to be merged with plugin info from service. Useful for debug.
 * @returns resolution for clear sign
 */
export declare function resolveTransaction(rawDataHex: string, loadConfig: LoadConfig | undefined, resolutionConfig: ResolutionConfig): Promise<LedgerTrxTransactionResolution | null>;
/**
 * Get plugin info of the given contract address and function for clear sign. The result is `undefined` if transaction is not TriggerSmartContract or no resolution found.
 * @param contractAddress contract address in TriggerSmartContract transaction
 * @param selector function selector in TriggerSmartContract transaction
 * @param loadConfig config for load transaction plugin info
 * @param loadConfig.pluginBaseURL base url to fetch plugin info
 * @param loadConfig.extraPlugins plugin info to be merged with plugin info from service. Useful for debug.
 * @returns plugin info with payload and signature if exists.
 */
export declare function getPluginInfoForContractMethod(contractAddress: string, selector: string, userLoadConfig?: LoadConfig): Promise<ContractMethod | undefined>;
export type TriggerSmartContractInfo = {
    contractAddress: string;
    selector: string;
};
/**
 * Deserialize contract raw data to get contract address and function selector.
 * @param rawTx raw data in hex
 * @returns contractAddress and function selector
 */
export declare function deserializeContractInfoFromHex(rawTx: string): TriggerSmartContractInfo | undefined;
export {};
//# sourceMappingURL=contract.d.ts.map