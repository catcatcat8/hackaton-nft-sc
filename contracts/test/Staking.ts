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

describe('Staking additional tests', function () {
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
    const { organization, nft, rewardToken } = await deployContracts()

    const stakingFactory =
      await hre.ethers.getContractFactory<Staking__factory>('Staking')
    await expect(stakingFactory.connect(organization).deploy(ethers.constants.AddressZero, rewardToken.address)).revertedWith('stakingNft_: address(0)')
    await expect(stakingFactory.connect(organization).deploy(nft.address, ethers.constants.AddressZero)).revertedWith('rewardToken_: address(0)')
  })
  it('Stake/Unstake from not NFT should revert', async function () {
    const { organization, staking } = await deployContracts()

    await expect(staking.connect(organization).stake(1, organization.address)).revertedWith('Sender is not NFT contract')
    await expect(staking.connect(organization).unstake(1)).revertedWith('Sender is not NFT contract')
  })
})
