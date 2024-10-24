import { ethers } from 'ethers'
import { NFT__factory } from './typechain'
import { PinataSDK } from 'pinata-web3'

export const DEFAULT_RPC = 'https://bsc-testnet.public.blastapi.io'
export const DEFAULT_PROVIDER = new ethers.providers.JsonRpcProvider(
  DEFAULT_RPC
)

export const ALLOWED_CHAIN_ID = 97
export const SCANNER_LINK = 'https://testnet.bscscan.com/tx/'
export const IPFS_BASE_LINK = 'https://ipfs.io/ipfs/'

export const NFT_ADDR = '0x225774cB32E49bceA6Ac1F44F86cCE87ACd241b6'
export const NFT_CONTRACT = NFT__factory.connect(NFT_ADDR, DEFAULT_PROVIDER)

export const PINATA_JWT = process.env.REACT_APP_PINATA_JWT ?? ''
export const PINATE_GATEWAY = process.env.REACT_APP_GATEWAY_URL ?? ''

export const PINATA = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATE_GATEWAY,
})

export const REACT_APP_BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL
