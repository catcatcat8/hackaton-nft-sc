import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments

  const [deployer] = await ethers.getSigners()

  const nft = await ethers.getContract('NFT')
  const rewardToken = await ethers.getContract('RewardToken')

  await deploy('Staking', {
    contract: 'Staking',
    from: deployer.address,
    args: [nft.address, rewardToken.address],
    log: true,
  })
}
export default func
func.tags = ['Staking']
func.dependencies = ['RewardToken', 'NFT']
