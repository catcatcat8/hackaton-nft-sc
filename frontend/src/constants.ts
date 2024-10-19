import { ethers } from 'ethers'
import { NFT__factory } from './typechain'
import { PinataSDK } from 'pinata-web3'

export const DEFAULT_RPC = 'https://bsc-testnet.blockpi.network/v1/rpc/public'
export const DEFAULT_PROVIDER = new ethers.providers.JsonRpcProvider(
  DEFAULT_RPC
)

export const ALLOWED_CHAIN_ID = 97
export const SCANNER_LINK = 'https://testnet.bscscan.com/tx/'
export const IPFS_BASE_LINK = 'https://ipfs.io/ipfs/'

export const NFT_ADDR = '0x130a563E1d2CBe7D9fc1DCd20a291e703baff8F9'
export const NFT_CONTRACT = NFT__factory.connect(NFT_ADDR, DEFAULT_PROVIDER)

export const PINATA_JWT = process.env.REACT_APP_PINATA_JWT ?? ''
export const PINATE_GATEWAY = process.env.REACT_APP_GATEWAY_URL ?? ''

export const PINATA = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATE_GATEWAY,
})
