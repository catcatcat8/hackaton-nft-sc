// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @title Reward company token
 * @author Крипто$лоня₽ы team
 * @notice A reward token for working in a company, reflecting the employee's length of service
 */
contract RewardToken is ERC20 { // @todo supply for organisation
    address public immutable staking;

    /**
     * @param staking_ Staking contract address
     * @param name_ ERC20 token name
     * @param symbol_ ERC20 token symbol
     * @param initialSupply_ Initial supply for DEX listing
     */
    constructor(address staking_, string memory name_, string memory symbol_, uint256 initialSupply_) ERC20(name_, symbol_) {
        require(staking_ != address(0), 'staking_: address(0)');
        require(bytes(name_).length != 0, 'name_: empty');
        require(bytes(symbol_).length != 0, 'symbol_: empty');

        staking = staking_;
        if (initialSupply_ != 0) {
            _mint(msg.sender, initialSupply_);
        }
    }

    /**
     * @notice Mints new ERC20 tokens
     * @dev Can be called only from the staking contract
     * @param to_ User address to mint to
     * @param amount_ Amount to mint
     */
    function mint(address to_, uint256 amount_) external {
        require(msg.sender == staking, 'Only staking');
        
        _mint(to_, amount_);
    }
}
