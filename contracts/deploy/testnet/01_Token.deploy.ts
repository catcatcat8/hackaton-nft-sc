import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

export const TOKEN_NAME = 'Diamond Coin'
export const TOKEN_SYMBOL = 'DC'
export const INITIAL_SUPPLY = BigNumber.from(1000000).mul(
  BigNumber.from(10).pow(18)
)

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre
  const { deploy } = deployments

  const [deployer] = await ethers.getSigners()

  const nonce = await hre.ethers.provider.getTransactionCount(deployer.address)
  const stakingAddr = ethers.utils.getContractAddress({
    from: deployer.address,
    nonce: nonce + 3,
  })

  await deploy('RewardToken', {
    contract: 'RewardToken',
    from: deployer.address,
    args: [stakingAddr, TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY],
    log: true,
  })
}
export default func
func.tags = ['RewardToken']
