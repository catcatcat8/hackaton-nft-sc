import { expect } from 'chai'
import hre from 'hardhat'
import { NFT__factory } from '@/typechain'
import {
  DEFAULT_BASE_URI,
  DEFAULT_COLLECTION_NAME,
  DEFAULT_COLLECTION_SYMBOL,
} from '../deploy/localhost/NFT.deploy'
import { BigNumber } from 'ethers'
import { ethers } from 'ethers'

const NFT_URI = 'ipfshash...'

describe('NFT tests', function () {
  async function deployContracts() {
    const [organization, worker] = await hre.ethers.getSigners()

    const nftFactory = await hre.ethers.getContractFactory<NFT__factory>('NFT')
    const nft = await nftFactory
      .connect(organization)
      .deploy(
        DEFAULT_COLLECTION_NAME,
        DEFAULT_COLLECTION_SYMBOL,
        DEFAULT_BASE_URI
      )

    const adminRole = await nft.ADMIN_ROLE()
    await nft.connect(organization).grantRole(adminRole, organization.address)

    return { nft, organization, worker }
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
    const [organization] = await hre.ethers.getSigners()

    const nftFactory = await hre.ethers.getContractFactory<NFT__factory>('NFT')
    await expect(
      nftFactory
        .connect(organization)
        .deploy('', DEFAULT_COLLECTION_SYMBOL, DEFAULT_BASE_URI)
    ).revertedWith('name_: empty')
    await expect(
      nftFactory
        .connect(organization)
        .deploy(DEFAULT_COLLECTION_NAME, '', DEFAULT_BASE_URI)
    ).revertedWith('symbol_: empty')
    await expect(
      nftFactory
        .connect(organization)
        .deploy(DEFAULT_COLLECTION_NAME, DEFAULT_COLLECTION_SYMBOL, '')
    ).revertedWith('baseURI_: empty')
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

    await expect(nft.connect(worker).burn(0)).reverted
    await nft.connect(organization).burn(0)

    await expect(nft.ownerOf(0)).revertedWith('ERC721: invalid token ID')
    expect(await nft.balanceOf(worker.address)).eq(2)
    await expect(nft.tokenURI(0)).revertedWith('ERC721: invalid token ID')
    await expect(nft.getIdsSliceByHolder(worker.address, 0, 3)).reverted
    await expect(nft.getURIs([0])).revertedWith('ERC721: invalid token ID')

    const allUriInfo = await nft.getAllURIsInfo(0, 3)
    expect(allUriInfo[0].owner).eq(ethers.constants.AddressZero)
    expect(allUriInfo[0].tokenId).eq(0)
    expect(allUriInfo[0].tokenUri).eq('')
    expect(allUriInfo[1].owner).eq(worker.address)
    expect(allUriInfo[1].tokenId).eq(1)
    expect(allUriInfo[1].tokenUri).eq(DEFAULT_BASE_URI + '1')
    expect(allUriInfo[2].owner).eq(worker.address)
    expect(allUriInfo[2].tokenId).eq(2)
    expect(allUriInfo[2].tokenUri).eq(DEFAULT_BASE_URI + '2')
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
})
