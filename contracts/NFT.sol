// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ERC721URIStorage, ERC721} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

/**
 * @title NFT contract for Digital Profiles
 * @author Крипто$лоня₽ы team
 * @notice Allows to mint/burn NFT for ADMIN_ROLE, metadata is immutable and can't be changed after mint.
 */
contract NFT is ERC721URIStorage, AccessControl {
    using EnumerableSet for EnumerableSet.UintSet;

    bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE'); // can mint and burn NFTs
    string public BASE_URI;

    uint256 public counter; // total count of minted NFTs
    mapping(address holder => EnumerableSet.UintSet ids) private _idsPerHolder;

    event SetBaseUri(string indexed newBaseUri);

    /**
     * @param name_ Collection name
     * @param symbol_ Collection symbol
     * @param baseURI_ Base URI for all NFT IDs
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        require(bytes(name_).length != 0, 'name_: empty');
        require(bytes(symbol_).length != 0, 'symbol_: empty');
        require(bytes(baseURI_).length != 0, 'baseURI_: empty');

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        BASE_URI = baseURI_;
        emit SetBaseUri(baseURI_);
    }

    /**
     * @notice Creates a new NFT
     * @param to_ Owner of the newly created NFT
     * @param tokenURI_ NFT URI
     */
    function mint(
        address to_,
        string memory tokenURI_
    ) external onlyRole(ADMIN_ROLE) {
        require(bytes(tokenURI_).length != 0, 'tokenURI_: empty');
        uint256 id = counter++;

        _mint(to_, id);
        _setTokenURI(id, tokenURI_);
        _idsPerHolder[to_].add(id);
    }

    /**
     * @notice Deletes NFT
     * @param tokenId_ NFT ID
     */
    function burn(uint256 tokenId_) external onlyRole(ADMIN_ROLE) {
        address owner = ownerOf(tokenId_);

        _burn(tokenId_);
        _idsPerHolder[owner].remove(tokenId_);
    }

    /**
     * @notice Emergency function to change base URI
     * @param baseUri_ New base URI
     */
    function changeBaseUri(
        string memory baseUri_
    ) external onlyRole(ADMIN_ROLE) {
        require(bytes(baseUri_).length != 0, 'baseUri_: empty');

        BASE_URI = baseUri_;
        emit SetBaseUri(baseUri_);
    }

    /**
     * @notice Helper function to get slice of user NFT IDs
     * @dev Offset-limit is necessary for the guaranteed return of a large array
     * @param holder User address
     * @param offset Offset to start with
     * @param limit Return size limit
     */
    function getIdsSliceByHolder(
        address holder,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](limit);
        for (uint256 i = 0; i < limit; ) {
            ids[i] = _idsPerHolder[holder].at(i + offset);
            unchecked {
                ++i;
            }
        }
        return ids;
    }

    /**
     * @notice Helper function to get list of metadata per call
     * @param ids NFT IDs
     */
    function getURIs(
        uint256[] memory ids
    ) external view returns (string[] memory) {
        uint256 idsLength = ids.length;
        string[] memory uris = new string[](idsLength);

        for (uint256 i = 0; i < idsLength; ) {
            uris[i] = tokenURI(ids[i]);
            unchecked {
                ++i;
            }
        }
        return uris;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return
            ERC721URIStorage.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return BASE_URI;
    }

    /**
     * @notice Transfers are not allowed (SBT-like)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256,
        uint256
    ) internal pure override {
        require(from == address(0) || to == address(0), 'Not transferable');
    }
}
