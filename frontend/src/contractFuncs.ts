import { BigNumber, ethers } from 'ethers'
import { NFT_CONTRACT } from './constants'

// VIEW


// Проверка на то админ ли текущий пользователь
export const checkIsAdmin = async (user: string): Promise<boolean> => {
  const adminRole = await NFT_CONTRACT.ADMIN_ROLE()
  return await NFT_CONTRACT.hasRole(adminRole, user)
}

// Сколько у пользователя всего нфт (user = wallet address)
export const userNftsCount = async (user: string): Promise<number> => {
  return (await NFT_CONTRACT.balanceOf(user)).toNumber()
}

export interface INFTMetadata0 {
  tokenIds: BigNumber[]
  tokenUris: string[]
}

// Получение нфт ссылок на ипфс by user wallet address
export const getUserNftUris = async (user: string): Promise<INFTMetadata0> => {
  const userBalance = await NFT_CONTRACT.balanceOf(user)
  if (userBalance == BigNumber.from(0)) {
    return { tokenIds: [], tokenUris: [] }
  }

  const userNftIds = await NFT_CONTRACT.getIdsSliceByHolder(
    user,
    0,
    userBalance
  )
  const uris = await NFT_CONTRACT.getURIs(userNftIds)
  return { tokenIds: userNftIds, tokenUris: uris }
}

export interface INFTMetadata1 {
  owner: string
  tokenId: BigNumber
  tokenUri: string
}

// Получение ВСЕХ нфт заминченных на контракте (ссылок на ипфс)
export const getAllNftsInfo = async (): Promise<INFTMetadata1[]> => {

  const nftCount = await NFT_CONTRACT.counter()
  if (nftCount == BigNumber.from(0)) {
    return []
  }

  const metadata = await NFT_CONTRACT.getAllURIsInfo(0, nftCount)
  return metadata
}

// список тех, кому заминтили на контракте нфт (профиль)
export const getNftHoldersList = async (): Promise<string[]> => {
  const holdersCount = await NFT_CONTRACT.getHoldersCount()
  return await NFT_CONTRACT.getHoldersSlice(0, holdersCount)
}

// Сотруднику заминтили main nft (профиль)
export const isNftHolder = async (user: string): Promise<boolean> => {
  return await NFT_CONTRACT.isHolder(user)
}
