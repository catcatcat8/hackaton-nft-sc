// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IRewardToken {
    function mint(address to_, uint256 amount_) external;
}

/**
 * @title NFT Staking
 * @author Крипто$лоня₽ы team
 * @notice NFT staking for company employees
 */
contract Staking {
    struct Stake {
        address user;
        uint256 earned;
        uint256 startTimestamp;
        uint256 unstakedAt;
    }

    // Approximately 1 token per second
    uint256 public constant REWARD_RATE_PER_SEC = 11574074074074;

    address public immutable stakingNft;
    address public immutable rewardToken;

    mapping(uint256 nftId => Stake stakeInfo) public stakesInfo;

    modifier onlyNftContract() {
        require(msg.sender == stakingNft, 'Sender is not NFT contract');
        _;
    }

    event Staked(address indexed user, uint256 indexed nftId);
    event Unstaked(address indexed user, uint256 indexed nftId, uint256 reward);

    /**
     * @param stakingNft_ NFT contract address
     * @param rewardToken_ Reward token contract address
     */
    constructor(address stakingNft_, address rewardToken_) {
        require(stakingNft_ != address(0), 'stakingNft_: address(0)');
        require(rewardToken_ != address(0), 'rewardToken_: address(0)');

        stakingNft = stakingNft_;
        rewardToken = rewardToken_;
    }

    /**
     * @notice Stakes NFT on the Staking contract
     * @dev NOT transferring NFT directly to the staking.
     * Ownership of the NFT remains with the employee.
     * Double-stake is impossible due to mint NFT logic.
     * @param nftId_ NFT token ID
     * @param holder_ Holder address
     */
    function stake(uint256 nftId_, address holder_) external onlyNftContract {
        stakesInfo[nftId_] = Stake({
            user: holder_,
            earned: 0,
            startTimestamp: block.timestamp,
            unstakedAt: 0
        });
        emit Staked(holder_, nftId_);
    }

    /**
     * @notice Unstakes NFT and mints the reward to user
     * @dev Double-unstake is not possible due to burn NFT logic
     * @param nftId_ NFT token ID
     */
    function unstake(uint256 nftId_) external onlyNftContract {
        Stake storage stake_ = stakesInfo[nftId_];
        address user = stake_.user;

        uint256 stakeDuration = block.timestamp - stake_.startTimestamp;
        uint256 reward = stakeDuration * REWARD_RATE_PER_SEC; // overflow is not possible

        stake_.earned = reward;
        stake_.unstakedAt = block.timestamp;

        IRewardToken(rewardToken).mint(user, reward); // re-entrancy is not possible
        emit Unstaked(user, nftId_, reward);
    }
}
