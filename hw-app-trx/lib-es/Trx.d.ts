/// <reference types="node" />
import type Transport from "@ledgerhq/hw-transport";
import { LedgerTrxTransactionResolution, LoadConfig, ResolutionConfig } from "./services/types";
import { ledgerService } from "./services/ledger";
import type { TIP712Message } from "./TIP712/types";
export { ledgerService };
/**
 * Tron API
 *
 * @example
 * import Trx from "@ledgerhq/hw-app-trx";
 * const trx = new Trx(transport)
 */
export default class Trx {
    transport: Transport;
    loadConfig: LoadConfig;
    setLoadConfig(loadConfig: LoadConfig): void;
    constructor(transport: Transport, scrambleKey?: string, loadConfig?: LoadConfig);
    /**
     * get Tron address for a given BIP 32 path.
     * @param path a path in BIP 32 format
     * @option boolDisplay optionally enable or not the display
     * @return an object with a publicKey and address
     * @example
     * const address = await tron.getAddress("44'/195'/0'/0/0").then(o => o.address)
     */
    getAddress(path: string, boolDisplay?: boolean): Promise<{
        publicKey: string;
        address: string;
    }>;
    getNextLength(tx: Buffer): number;
    /**
     * sign a Tron transaction with a given BIP 32 path and Token Names
     *
     * @param path a path in BIP 32 format
     * @param rawTxHex a raw transaction hex string
     * @param tokenSignatures Tokens Signatures array
     * @param resolution plugin infomations for clear sign. Only supported when sign a TriggerSmartContract transaction.
     *        - If the value is "null", clear sign will be disabled.
     *        - If the value is "undefined", default resolution will be used.
     * @option version pack message based on ledger firmware version
     * @option smartContract boolean hack to set limit buffer on ledger device
     * @return a signature as hex string
     * @example
     * import { ledgerService } from '@ledgerhq/hw-app-trx';
     * const rawTxHex = "0a0267a42208cb83283f5927a5e040c8badeb489325ab001081f12a9010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412740a1541e2ae49db6a70b9b4757d2137a43b69b24a4457801215410e1bce983f78f8913002c3f7e52daf78de6da2cb2244a9059cbb000000000000000000000000573708726db88a32c1b9c828fef508577cfb8483000000000000000000000000000000000000000000000000000000000000000a286470a6f8dab48932900180ade204";
     * const resolution = await ledgerService.resolveTransaction(rawTxHex);
     * const signature = await tron.signTransaction("44'/195'/0'/0/0", rawTxHex, [], resolution);
     */
    signTransaction(path: string, rawTxHex: string, tokenSignatures: string[], resolution?: LedgerTrxTransactionResolution | null): Promise<string>;
    private _signTransaction;
    private _clearSignTransaction;
    /**
     * sign a Tron transaction hash with a given BIP 32 path
     *
     * @param path a path in BIP 32 format
     * @param rawTxHex a raw transaction hex string
     * @return a signature as hex string
     * @example
     * const signature = await tron.signTransactionHash("44'/195'/0'/0/0", "25b18a55f86afb10e7aca38d0073d04c80397c6636069193953fdefaea0b8369");
     */
    signTransactionHash(path: string, rawTxHashHex: string): Promise<string>;
    /**
     * sign a Tron transaction with a given BIP 32 using clear signing. This method will use default plugin service to resolve the plugin for transaction.
     * @param path a path in BIP 32 format
     * @param rawTxHex a raw transaction hex string
     * @param resolutionConfig: configuration about what should be clear signed in the transaction
     * @param throwOnError: optional parameter to determine if a failing resolution of the transaction should throw an error or not
     * @return a signature as hex string
     * @example
     * const signature = await tron.clearSignTransaction("44'/195'/0'/0/0", "0a0267a42208cb83283f5927a5e040c8badeb489325ab001081f12a9010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412740a1541e2ae49db6a70b9b4757d2137a43b69b24a4457801215410e1bce983f78f8913002c3f7e52daf78de6da2cb2244a9059cbb000000000000000000000000573708726db88a32c1b9c828fef508577cfb8483000000000000000000000000000000000000000000000000000000000000000a286470a6f8dab48932900180ade204",{externalPlugins: true});
     */
    clearSignTransaction(path: string, rawTxHex: string, resolutionConfig: ResolutionConfig, throwOnError?: boolean): Promise<string>;
    /**
     * get the version of the Tron app installed on the hardware device
     *
     * @return an object with a version
     * @example
     * const result = await tron.getAppConfiguration();
     * {
     *   "version": "0.1.5",
     *   "versionN": "105".
     *   "allowData": false,
     *   "allowContract": false,
     *   "truncateAddress": false,
     *   "signByHash": false
     * }
     */
    getAppConfiguration(): Promise<{
        allowContract: boolean;
        truncateAddress: boolean;
        allowData: boolean;
        signByHash: boolean;
        version: string;
        versionN: number;
    }>;
    /**
     * sign a Tron Message with a given BIP 32 path
     *
     * @param path a path in BIP 32 format
     * @param message hex string to sign
     * @return a signature as hex string
     * @example
     * const signature = await tron.signPersonalMessage("44'/195'/0'/0/0", "43727970746f436861696e2d54726f6e5352204c6564676572205472616e73616374696f6e73205465737473");
     */
    signPersonalMessage(path: string, messageHex: string): Promise<string>;
    /**
     * sign a Tron Message with a given BIP 32 path
     *
     * @param path a path in BIP 32 format
     * @param message hex string to sign
     * @return a signature as hex string
     * @example
     * const signature = await tron.signPersonalMessageFullDisplay("44'/195'/0'/0/0", "43727970746f436861696e2d54726f6e5352204c6564676572205472616e73616374696f6e73205465737473");
     */
    signPersonalMessageFullDisplay(path: string, messageHex: string): Promise<string>;
    /**
     * Sign a typed data. The host computes the domain separator and hashStruct(message)
     * @example
       const signature = await tronApp.signTIP712HashedMessage("44'/195'/0'/0/0",Buffer.from( "0101010101010101010101010101010101010101010101010101010101010101").toString("hex"), Buffer.from("0202020202020202020202020202020202020202020202020202020202020202").toString("hex"));
     */
    signTIP712HashedMessage(path: string, domainSeparatorHex: string, hashStructMessageHex: string): Promise<string>;
    /**
     * Sign a typed data. The host computes the domain separator and hashStruct(message)
     * @example
       const signature = await tronApp.signTIP712Message("44'/195'/0'/0/0", message);
     */
    signTIP712Message(path: string, typedMessage: TIP712Message, fullImplem: boolean, loadConfig: LoadConfig): Promise<string>;
    /**
     * get Tron address for a given BIP 32 path.
     * @param path a path in BIP 32 format
     * @param publicKey address public key to generate pair key
     * @return shared key hex string,
     * @example
     * const signature = await tron.getECDHPairKey("44'/195'/0'/0/0", "04ff21f8e64d3a3c0198edfbb7afdc79be959432e92e2f8a1984bb436a414b8edcec0345aad0c1bf7da04fd036dd7f9f617e30669224283d950fab9dd84831dc83");
     */
    getECDHPairKey(path: string, publicKey: string): Promise<string>;
    /**
     * provides the name of a trusted binding of a plugin with a contract address and a supported method selector.
     * This plugin will be called to interpret contract data in the following transaction signing command.
     *
     * @param payload external plugin data
     * @param signature signature for the plugin
     * @returns boolean. It's `true` when set plugin successfully.
     */
    setExternalPlugin(payload: string, signature: string): Promise<boolean>;
}
//# sourceMappingURL=Trx.d.ts.map