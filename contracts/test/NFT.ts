import { expect } from 'chai'
import hre, { network } from 'hardhat'
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
import { BigNumber, BigNumberish } from 'ethers'
import { ethers } from 'ethers'
import {
  INITIAL_SUPPLY,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from '../deploy/localhost/01_Token.deploy'

const NFT_URI = 'ipfshash...'
const REWARD_PER_SEC = BigNumber.from('11574074074074')

export const sleep = async (seconds: BigNumberish) => {
  await network.provider.send("evm_increaseTime", [
      Number(seconds),
  ]);
  await network.provider.send("evm_mine");
};

describe('NFT & Staking tests', function () {
  async function deployContracts() {
    const [organization, worker, worker2] = await hre.ethers.getSigners()

    const nftFactory = await hre.ethers.getContractFactory<NFT__factory>('NFT')
    const stakingFactory =
      await hre.ethers.getContractFactory<Staking__factory>('Staking')
    const rewardTokenFactory =
      await hre.ethers.getContractFactory<RewardToken__factory>('RewardToken')

    const nonce = await hre.ethers.provider.getTransactionCount(
      organization.address
    )
    const nftAddr = ethers.utils.getContractAddress({
      from: organization.address,
      nonce: nonce + 1,
    })
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

    return { nft, rewardToken, staking, organization, worker, worker2 }
  }

  it('Constructor + setup should work correctly', async function () {
    const { nft, organization, worker } = await deployContracts()

    expect(await nft.name()).eq(DEFAULT_COLLECTION_NAME)
    expect(await nft.symbol()).eq(DEFAULT_COLLECTION_SYMBOL)
    expect(await nft.BASE_URI()).eq(DEFAULT_BASE_URI)

    const adminRole = await nft.ADMIN_ROLE()
    expect(await nft.hasRole(adminRole, organization.address)).true
    expect(await nft.hasRole(adminRole, worker.address)).false
  })
  it('Constructor should revert', async function () {
    const { staking } = await deployContracts()
    const [organization] = await hre.ethers.getSigners()

    const nftFactory = await hre.ethers.getContractFactory<NFT__factory>('NFT')
    await expect(
      nftFactory
        .connect(organization)
        .deploy(
          '',
          DEFAULT_COLLECTION_SYMBOL,
          DEFAULT_BASE_URI,
          staking.address
        )
    ).revertedWith('name_: empty')
    await expect(
      nftFactory
        .connect(organization)
        .deploy(DEFAULT_COLLECTION_NAME, '', DEFAULT_BASE_URI, staking.address)
    ).revertedWith('symbol_: empty')
    await expect(
      nftFactory
        .connect(organization)
        .deploy(
          DEFAULT_COLLECTION_NAME,
          DEFAULT_COLLECTION_SYMBOL,
          '',
          staking.address
        )
    ).revertedWith('baseURI_: empty')
    await expect(
      nftFactory
        .connect(organization)
        .deploy(
          DEFAULT_COLLECTION_NAME,
          DEFAULT_COLLECTION_SYMBOL,
          DEFAULT_BASE_URI,
          ethers.constants.AddressZero
        )
    ).revertedWith('staking_: address(0)')
  })
  it('Should correctly create new NFTs', async function () {
    const { nft, organization, worker } = await deployContracts()

    await expect(
      nft.connect(organization).mint(worker.address, '')
    ).revertedWith('tokenURI_: empty')
    await expect(nft.connect(worker).mint(worker.address, NFT_URI)).reverted

    await nft.connect(organization).mint(worker.address, NFT_URI)

    expect(await nft.ownerOf(0)).eq(worker.address)
    expect(await nft.balanceOf(worker.address)).eq(1)
    expect(await nft.tokenURI(0)).eq(DEFAULT_BASE_URI + NFT_URI)
    expect(await nft.getIdsSliceByHolder(worker.address, 0, 1)).deep.eq([
      BigNumber.from(0),
    ])

    expect(await nft.counter()).eq(1)
    await nft.connect(organization).mint(worker.address, NFT_URI)
    expect(await nft.counter()).eq(2)
    const ids = await nft.getIdsSliceByHolder(worker.address, 0, 2)
    expect(ids[0]).eq(0)
    expect(ids[1]).eq(1)

    const uris = await nft.getURIs([0])
    expect(uris[0]).eq(DEFAULT_BASE_URI + NFT_URI)

    const allUriInfo = await nft.getAllURIsInfo(0, 2)
    expect(allUriInfo[0].tokenId).eq(0)
    expect(allUriInfo[0].owner).eq(worker.address)
    expect(allUriInfo[0].tokenUri).eq(DEFAULT_BASE_URI + NFT_URI)
    expect(allUriInfo[1].tokenId).eq(1)
    expect(allUriInfo[1].owner).eq(worker.address)
    expect(allUriInfo[1].tokenUri).eq(DEFAULT_BASE_URI + NFT_URI)
  })
  it('Should correctly burn NFTs', async function () {
    const { nft, organization, worker } = await deployContracts()

    await nft.connect(organization).mint(worker.address, NFT_URI)
    await nft.connect(organization).mint(worker.address, '1')
    await nft.connect(organization).mint(worker.address, '2')

    await expect(nft.connect(worker).burn(2)).reverted
    await nft.connect(organization).burn(2)

    await expect(nft.ownerOf(2)).revertedWith('ERC721: invalid token ID')
    expect(await nft.balanceOf(worker.address)).eq(2)
    await expect(nft.tokenURI(2)).revertedWith('ERC721: invalid token ID')
    await expect(nft.getIdsSliceByHolder(worker.address, 0, 3)).reverted
    await expect(nft.getURIs([2])).revertedWith('ERC721: invalid token ID')

    const allUriInfo = await nft.getAllURIsInfo(0, 3)
    expect(allUriInfo[0].owner).eq(worker.address)
    expect(allUriInfo[0].tokenId).eq(0)
    expect(allUriInfo[0].tokenUri).eq(DEFAULT_BASE_URI + NFT_URI)
    expect(allUriInfo[1].owner).eq(worker.address)
    expect(allUriInfo[1].tokenId).eq(1)
    expect(allUriInfo[1].tokenUri).eq(DEFAULT_BASE_URI + '1')
    expect(allUriInfo[2].owner).eq(ethers.constants.AddressZero)
    expect(allUriInfo[2].tokenId).eq(2)
    expect(allUriInfo[2].tokenUri).eq('')

    expect(await nft.getHoldersCount()).eq(1)
    expect(await nft.getHoldersSlice(0, 1)).deep.eq([worker.address])
    expect(await nft.isHolder(worker.address)).true

    expect(await nft.getUserMainNft(worker.address)).eq(0)

    await expect(nft.connect(organization).burn(0)).revertedWith(
      'MAIN NFT is burned last'
    )
    await nft.connect(organization).burn(1)
    await nft.connect(organization).burn(0)

    await expect(nft.getUserMainNft(worker.address)).revertedWith('Not holder')

    expect(await nft.getHoldersCount()).eq(0)
    await expect(nft.getHoldersSlice(0, 1)).reverted
    expect(await nft.isHolder(worker.address)).false
  })
  it('Should correctly change base URI', async function () {
    const { nft, organization, worker } = await deployContracts()

    const NEW_BASE_URI = 'https://pinata.com/ipfs/'
    await expect(nft.connect(worker).changeBaseUri(NEW_BASE_URI)).reverted
    await expect(nft.connect(organization).changeBaseUri('')).revertedWith(
      'baseUri_: empty'
    )

    await nft.connect(organization).mint(worker.address, NFT_URI)
    await nft.connect(organization).changeBaseUri(NEW_BASE_URI)
    expect(await nft.tokenURI(0)).eq(NEW_BASE_URI + NFT_URI)
  })
  it('Should not allow to transfer NFT', async function () {
    const { nft, organization, worker } = await deployContracts()

    await nft.connect(organization).mint(worker.address, NFT_URI)
    await expect(
      nft
        .connect(worker)
        ['safeTransferFrom(address,address,uint256)'](
          worker.address,
          organization.address,
          0
        )
    ).revertedWith('Not transferable')
  })
  it('Should correctly supports interface', async function () {
    const { nft } = await deployContracts()

    const accessControlId = '0x7965db0b'
    const erc721Id = '0x5b5e139f'

    expect(await nft.supportsInterface(accessControlId)).true
    expect(await nft.supportsInterface(erc721Id)).true
    expect(await nft.supportsInterface('0x12345678')).false
  })
  it('Should correctly mint reward tokens through staking', async function () {
    const { nft, organization, worker, staking, rewardToken, worker2 } = await deployContracts()

    await nft.connect(organization).mint(worker.address, NFT_URI)

    const sleepTime = 30
    await sleep(sleepTime)

    await nft.connect(organization).burn(0)
    expect(await rewardToken.balanceOf(worker.address)).eq(REWARD_PER_SEC.mul(sleepTime + 1)) // +1 due to new timestamp at this tx

    const stakeInfo0 = await staking.stakesInfo(0)
    expect(stakeInfo0.user).eq(worker.address)
    expect(stakeInfo0.earned).eq(REWARD_PER_SEC.mul(sleepTime + 1))
    expect(stakeInfo0.startTimestamp).not.eq(0)
    expect(stakeInfo0.unstakedAt).not.eq(0)
    expect(stakeInfo0.unstakedAt.sub(stakeInfo0.startTimestamp)).eq(sleepTime + 1)

    await nft.connect(organization).mint(worker2.address, '1')
    await nft.connect(organization).mint(worker2.address, '2')

    const stakeInfo = await staking.stakesInfo(1)
    expect(stakeInfo.user).eq(worker2.address)
    expect(stakeInfo.earned).eq(0)
    expect(stakeInfo.startTimestamp).not.eq(0)
    expect(stakeInfo.unstakedAt).eq(0)

    const stakeInfo1 = await staking.stakesInfo(2)
    expect(stakeInfo1.user).eq(ethers.constants.AddressZero)
    expect(stakeInfo1.earned).eq(0)
    expect(stakeInfo1.startTimestamp).eq(0)
    expect(stakeInfo1.unstakedAt).eq(0)
  })
})
