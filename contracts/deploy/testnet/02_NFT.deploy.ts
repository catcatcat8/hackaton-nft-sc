import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { NFT } from '@/typechain'
import { ethers } from 'hardhat'

export const DEFAULT_COLLECTION_NAME = 'Diamond Collection'
export const DEFAULT_COLLECTION_SYMBOL = 'DC'
export const DEFAULT_BASE_URI = 'https://ipfs.io/ipfs/'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre
  const { deploy } = deployments

  const [deployer] = await ethers.getSigners()

  const nonce = await hre.ethers.provider.getTransactionCount(deployer.address)
  const stakingAddr = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: nonce + 2,
  })

  await deploy('NFT', {
    contract: 'NFT',
    from: deployer.address,
    args: [
      DEFAULT_COLLECTION_NAME,
      DEFAULT_COLLECTION_SYMBOL,
      DEFAULT_BASE_URI,
      stakingAddr,
    ],
    log: true,
  })
  const nft = await await hre.ethers.getContract<NFT>('NFT')

  const adminRole = await nft.ADMIN_ROLE()
  const tx = await nft.connect(deployer).grantRole(adminRole, deployer.address)
  await tx.wait()
}
export default func
func.tags = ['NFT']
