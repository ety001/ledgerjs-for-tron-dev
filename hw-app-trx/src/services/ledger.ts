import { resolveTransaction } from "./contract";
import { getLoadConfig } from "./loadConfig";
import { LoadConfig } from "./types";
import axios from "axios";
import { log } from "@ledgerhq/logs";
import { signatures as signaturesByChainId } from "@ledgerhq/cryptoassets/data/evm/index";

export const ledgerService = {
  resolveTransaction,
};

export type TokenInfo = {
  contractAddress: string;
  ticker: string;
  decimals: number;
  chainId: number;
  signature: Buffer;
  data: Buffer;
};

export type API = {
  byContractAndChainId: (addr: string, id: number) => TokenInfo | null | undefined;
  list: () => TokenInfo[];
};

const asContractAddress = (addr: string) => {
  const a = addr.toLowerCase();
  return a.startsWith("0x") ? a : "0x" + a;
};

export const findTRC20SignaturesInfo = async (
  userLoadConfig: LoadConfig,
  chainId: number,
): Promise<string | null> => {
  const { cryptoassetsBaseURL } = getLoadConfig(userLoadConfig);
  if (!cryptoassetsBaseURL) return null;

  const url = `${cryptoassetsBaseURL}/evm/${chainId}/erc20-signatures.json`;
  const blob = await axios
    .get<string>(url)
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
};

/**
 * Retrieve the token information by a given contract address if any
 */
export const byContractAddressAndChainId = (
  contract: string,
  chainId: number,
  erc20SignaturesBlob?: string | null,
): ReturnType<API["byContractAndChainId"]> => {
  // If we are able to fetch data from s3 bucket that contains dynamic CAL
  if (erc20SignaturesBlob) {
    try {
      return parse(erc20SignaturesBlob).byContractAndChainId(asContractAddress(contract), chainId);
    } catch (e) {
      return get(chainId)?.byContractAndChainId(asContractAddress(contract), chainId);
    }
  }

  // the static fallback when dynamic cal is not provided
  return get(chainId)?.byContractAndChainId(asContractAddress(contract), chainId);
};

const parse = (trc20SignaturesBlob: string): API => {
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
  const entries: TokenInfo[] = [];
  let i = 0;

  while (i < buf.length) {
    const ticker = buf[i].ticker;
    const contractAddress = buf[i].addr;
    const decimals = buf[i].decimals;
    const chainId = buf[i].chain_id;
    const signature = Buffer.from(buf[i].signature);
    // console.log(buf[i].chain_id);
    const entry: TokenInfo = {
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
    byContractAndChainId: (contractAddress, chainId) =>
      map[String(chainId) + ":" + contractAddress],
  };
};

// this internal get() will lazy load and cache the data from the erc20 data blob
const get: (chainId: number) => API | null = (() => {
  const cache: Record<number, API> = {};
  return chainId => {
    if (cache[chainId]) return cache[chainId];

    const signatureBlob: string | undefined = signaturesByChainId[chainId];
    if (!signatureBlob) return null;

    const api = parse(signatureBlob);
    cache[chainId] = api;
    return api;
  };
})();
