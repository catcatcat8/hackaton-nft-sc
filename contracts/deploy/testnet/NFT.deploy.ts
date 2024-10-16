import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

export const DEFAULT_COLLECTION_NAME = 'Крипто$лоня₽ы Collection'
export const DEFAULT_COLLECTION_SYMBOL = 'KC'
export const DEFAULT_BASE_URI = 'https://ipfs.io/ipfs/' 

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  
  const {deployer} = await getNamedAccounts()
  
  await deploy('NFT', {
    contract: 'NFT',
    from: deployer,
    args: [DEFAULT_COLLECTION_NAME, DEFAULT_COLLECTION_SYMBOL, DEFAULT_BASE_URI],
    log: true,
  })
}
export default func
func.tags = ['NFT']
