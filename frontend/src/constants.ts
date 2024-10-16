import { ethers } from "ethers";
import { NFT__factory } from "./typechain";

export const DEFAULT_RPC = 'https://bsc-testnet.blockpi.network/v1/rpc/public'
export const DEFAULT_PROVIDER = new ethers.providers.JsonRpcProvider(DEFAULT_RPC)

export const ALLOWED_CHAIN_ID = 97
export const SCANNER_LINK = 'https://testnet.bscscan.com/tx/'

export const NFT_ADDR = '0x1b124fEaca2d852199a3F17aD249Afe2Df63E225'
export const NFT_CONTRACT = NFT__factory.connect(NFT_ADDR, DEFAULT_PROVIDER)

export const PINATA_JWT = process.env.REACT_APP_PINATA_JWT ?? ''
export const PINATE_GATEWAY = process.env.REACT_APP_GATEWAY_URL ?? ''