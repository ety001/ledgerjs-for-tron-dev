export type LedgerTrxTransactionResolution = {
    externalPlugin: Array<{
        payload: string;
        signature: string;
    }>;
};
export type PluginInfo = {
    plugin: string;
    serialized_data: string;
    signature: string;
};
export type LoadConfig = {
    pluginBaseURL?: string | null;
    /**
     * provide manually some extra plugins to add for the resolution (e.g. for dev purpose)
     * object will be merged with the returned value of the Ledger cdn payload
     * @example e.g.
     * {
     *    extraPlugins: {
     *      contractAddress: {
     *        functionSelector: {
     *          plugin: '',
     *          serialized_data: '',
     *          signature: '',
     *        }
     *      }
     *    }
     * }
     *
     */
    extraPlugins?: Record<string, Record<string, PluginInfo>> | null;
    cryptoassetsBaseURL?: string | null;
    calServiceURL?: string | null;
};
/**
 * Allows to configure precisely what the service need to resolve.
 * for instance you can set nft:true if you need clear signing on NFTs. If you set it and it is not a NFT transaction, it should still work but will do a useless service resolution.
 */
export type ResolutionConfig = {
    externalPlugins?: boolean;
};
export type LedgerTrxTransactionService = {
    resolveTransaction: (rawDataHex: string, loadConfig: LoadConfig) => Promise<LedgerTrxTransactionResolution>;
};
//# sourceMappingURL=types.d.ts.map