import Transport from "@ledgerhq/hw-transport";
import type { TIP712Message } from "./types";
import { LoadConfig } from "../services/types";
export declare const signTIP712HashedMessage: (transport: Transport, path: string, domainSeparatorHex: string, hashStructMessageHex: string) => Promise<string>;
/**
 * @ignore for the README
 *
 * Sign an EIP-721 formatted message following the specification here:
 * https://github.com/LedgerHQ/app-ethereum/blob/develop/doc/ethapp.asc#sign-eth-eip-712
 * @example
  eth.signEIP721Message("44'/60'/0'/0/0", {
    domain: {
      chainId: 69,
      name: "Da Domain",
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      version: "1"
    },
    types: {
      "EIP712Domain": [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" }
        ],
      "Test": [
        { name: "contents", type: "string" }
      ]
    },
    primaryType: "Test",
    message: {contents: "Hello, Bob!"},
  })
 *
 * @param {String} path derivationPath
 * @param {Object} typedMessage message to sign
 * @param {Boolean} fullImplem use the legacy implementation
 * @returns {Promise}
 */
export declare const signTIP712Message: (transport: Transport, path: string, typedMessage: TIP712Message, fullImplem: boolean | undefined, loadConfig: LoadConfig) => Promise<string>;
//# sourceMappingURL=index.d.ts.map