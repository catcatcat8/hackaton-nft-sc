import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { NFT } from '@/typechain'

export const DEFAULT_COLLECTION_NAME = 'Крипто$лоня₽ы Collection'
export const DEFAULT_COLLECTION_SYMBOL = 'KC'
export const DEFAULT_BASE_URI = 'https://ipfs.io/ipfs/'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  const signer = await hre.ethers.getSigner(deployer)

  await deploy('NFT', {
    contract: 'NFT',
    from: deployer,
    args: [
      DEFAULT_COLLECTION_NAME,
      DEFAULT_COLLECTION_SYMBOL,
      DEFAULT_BASE_URI,
    ],
    log: true,
  })
  const nft = await await hre.ethers.getContract<NFT>('NFT')

  const adminRole = await nft.ADMIN_ROLE()
  await nft.connect(signer).grantRole(adminRole, deployer)
}
export default func
func.tags = ['NFT']
