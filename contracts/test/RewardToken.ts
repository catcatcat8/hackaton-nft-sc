import { expect } from 'chai'
import hre from 'hardhat'
import {
  NFT__factory,
  RewardToken__factory,
  Staking__factory,
} from '@/typechain'
import {
  DEFAULT_BASE_URI,
  DEFAULT_COLLECTION_NAME,
  DEFAULT_COLLECTION_SYMBOL,
} from '../deploy/localhost/02_NFT.deploy'
import { BigNumber } from 'ethers'
import { ethers } from 'ethers'
import {
  INITIAL_SUPPLY,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from '../deploy/localhost/01_Token.deploy'

describe('Reward token additional tests', function () {
  async function deployContracts() {
    const [organization, worker] = await hre.ethers.getSigners()

    const nftFactory = await hre.ethers.getContractFactory<NFT__factory>('NFT')
    const stakingFactory =
      await hre.ethers.getContractFactory<Staking__factory>('Staking')
    const rewardTokenFactory =
      await hre.ethers.getContractFactory<RewardToken__factory>('RewardToken')

    const nonce = await hre.ethers.provider.getTransactionCount(
      organization.address
    )
    const stakingAddr = ethers.utils.getContractAddress({
      from: organization.address,
      nonce: nonce + 2,
    })

    const rewardToken = await rewardTokenFactory
      .connect(organization)
      .deploy(stakingAddr, TOKEN_NAME, TOKEN_SYMBOL, INITIAL_SUPPLY)
    const nft = await nftFactory
      .connect(organization)
      .deploy(
        DEFAULT_COLLECTION_NAME,
        DEFAULT_COLLECTION_SYMBOL,
        DEFAULT_BASE_URI,
        stakingAddr
      )
    const staking = await stakingFactory
      .connect(organization)
      .deploy(nft.address, rewardToken.address)

    const adminRole = await nft.ADMIN_ROLE()
    await nft.connect(organization).grantRole(adminRole, organization.address)

    return { nft, rewardToken, staking, organization, worker }
  }
  it('Constructor + setup should work correctly', async function () {
    const { rewardToken, staking, organization } = await deployContracts()

    expect(await rewardToken.staking()).eq(staking.address)
    expect(await rewardToken.balanceOf(organization.address)).eq(INITIAL_SUPPLY)

    const rewardTokenFactory =
      await hre.ethers.getContractFactory<RewardToken__factory>('RewardToken')
    const rewardToken2 = await rewardTokenFactory
      .connect(organization)
      .deploy(staking.address, TOKEN_NAME, TOKEN_SYMBOL, 0)
    expect(await rewardToken2.balanceOf(organization.address)).eq(0)
  })
  it('Constructor should revert', async function () {
    const { staking, organization } = await deployContracts()

    const rewardTokenFactory =
      await hre.ethers.getContractFactory<RewardToken__factory>('RewardToken')
    await expect(rewardTokenFactory.connect(organization).deploy(ethers.constants.AddressZero, TOKEN_NAME, TOKEN_SYMBOL, 0)).revertedWith('staking_: address(0)')
    await expect(rewardTokenFactory.connect(organization).deploy(staking.address, '', TOKEN_SYMBOL, 0)).revertedWith('name_: empty')
    await expect(rewardTokenFactory.connect(organization).deploy(staking.address, TOKEN_NAME, '', 0)).revertedWith('symbol_: empty')
  })
  it('Mint from not staking should revert', async function () {
    const { organization, rewardToken } = await deployContracts()

    await expect(rewardToken.connect(organization).mint(organization.address, 1)).revertedWith('Only staking')
  })
})
