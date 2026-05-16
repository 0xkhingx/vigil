// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VigilSlash
 * @notice AI-custodied trader bonds. Stake. Watch. Slash.
 * @dev Oracle is the only address authorized to update scores and trigger slashes
 */
contract VigilSlash is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ═══════════════════════════════════════════
    // TYPES
    // ═══════════════════════════════════════════

    enum BondStatus { ACTIVE, SLASHED, EXITED }

    struct TraderBond {
        address trader;
        uint256 bondAmount;       // USDC the trader put up
        uint256 slashThreshold;   // AI score below which slash triggers
        uint256 currentScore;     // latest AI score from oracle
        uint256 createdAt;
        BondStatus status;
    }

    struct FollowerStake {
        address follower;
        uint256 stakedAmount;     // USDC the follower staked
        uint256 earnedAmount;     // yield accumulated
        uint256 joinedAt;
        bool exists;
    }

    // ═══════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════

    IERC20 public usdc;
    address public oracle;
    address public owner;
    uint256 public protocolFeePercent = 2; // 2% protocol fee on slashes

    // traderId => TraderBond
    mapping(uint256 => TraderBond) public traderBonds;

    // traderId => follower address => FollowerStake
    mapping(uint256 => mapping(address => FollowerStake)) public followerStakes;

    // traderId => list of follower addresses
    mapping(uint256 => address[]) public traderFollowers;

    uint256 public nextTraderId = 1;

    // ═══════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════

    event TraderBonded(uint256 indexed traderId, address indexed trader, uint256 amount);
    event FollowerStaked(uint256 indexed traderId, address indexed follower, uint256 amount);
    event ScoreUpdated(uint256 indexed traderId, uint256 oldScore, uint256 newScore);
    event BondSlashed(uint256 indexed traderId, uint256 slashAmount, uint256 followersCompensated);
    event FollowerExited(uint256 indexed traderId, address indexed follower, uint256 returned);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);

    // ═══════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════

    modifier onlyOracle() {
        require(msg.sender == oracle, "Vigil: caller is not the oracle");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Vigil: caller is not the owner");
        _;
    }

    modifier bondActive(uint256 traderId) {
        require(traderBonds[traderId].status == BondStatus.ACTIVE, "Vigil: bond is not active");
        _;
    }

    // ═══════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════

    constructor(address _usdc, address _oracle) {
        usdc = IERC20(_usdc);
        oracle = _oracle;
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════
    // TRADER FUNCTIONS
    // ═══════════════════════════════════════════

    /**
     * @notice Trader posts a bond to attract followers
     * @param amount USDC amount to bond
     * @param slashThreshold AI score below which slash triggers (0-100)
     * @param initialScore Starting AI score from oracle
     */
    function postBond(
        uint256 amount,
        uint256 slashThreshold,
        uint256 initialScore
    ) external nonReentrant returns (uint256 traderId) {
        require(amount > 0, "Vigil: bond amount must be > 0");
        require(slashThreshold > 0 && slashThreshold < 100, "Vigil: invalid threshold");
        require(initialScore <= 100, "Vigil: invalid score");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        traderId = nextTraderId++;
        traderBonds[traderId] = TraderBond({
            trader: msg.sender,
            bondAmount: amount,
            slashThreshold: slashThreshold,
            currentScore: initialScore,
            createdAt: block.timestamp,
            status: BondStatus.ACTIVE
        });

        emit TraderBonded(traderId, msg.sender, amount);
    }

    // ═══════════════════════════════════════════
    // FOLLOWER FUNCTIONS
    // ═══════════════════════════════════════════

    /**
     * @notice Follower stakes USDC alongside a trader
     * @param traderId The trader to back
     * @param amount USDC amount to stake
     */
    function stake(
        uint256 traderId,
        uint256 amount
    ) external nonReentrant bondActive(traderId) {
        require(amount > 0, "Vigil: stake amount must be > 0");
        require(!followerStakes[traderId][msg.sender].exists, "Vigil: already staked");

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        followerStakes[traderId][msg.sender] = FollowerStake({
            follower: msg.sender,
            stakedAmount: amount,
            earnedAmount: 0,
            joinedAt: block.timestamp,
            exists: true
        });

        traderFollowers[traderId].push(msg.sender);

        emit FollowerStaked(traderId, msg.sender, amount);
    }

    /**
     * @notice Follower exits their position and withdraws
     * @param traderId The trader position to exit
     */
    function exit(uint256 traderId) external nonReentrant {
        FollowerStake storage fs = followerStakes[traderId][msg.sender];
        require(fs.exists, "Vigil: no stake found");

        uint256 total = fs.stakedAmount + fs.earnedAmount;
        fs.stakedAmount = 0;
        fs.earnedAmount = 0;
        fs.exists = false;

        usdc.safeTransfer(msg.sender, total);

        emit FollowerExited(traderId, msg.sender, total);
    }

    // ═══════════════════════════════════════════
    // ORACLE FUNCTIONS
    // ═══════════════════════════════════════════

    /**
     * @notice Oracle updates a trader's AI score
     * @param traderId The trader to update
     * @param newScore New AI score (0-100)
     */
    function updateScore(
        uint256 traderId,
        uint256 newScore
    ) external onlyOracle bondActive(traderId) {
        require(newScore <= 100, "Vigil: invalid score");

        uint256 oldScore = traderBonds[traderId].currentScore;
        traderBonds[traderId].currentScore = newScore;

        emit ScoreUpdated(traderId, oldScore, newScore);
    }

    /**
     * @notice Oracle triggers a slash when score drops below threshold
     * @param traderId The trader to slash
     * @param slashPercent Percentage of bond to slash (1-100)
     */
    function slash(
        uint256 traderId,
        uint256 slashPercent
    ) external onlyOracle bondActive(traderId) nonReentrant {
        TraderBond storage bond = traderBonds[traderId];

        require(
            bond.currentScore < bond.slashThreshold,
            "Vigil: score above threshold, cannot slash"
        );
        require(slashPercent > 0 && slashPercent <= 100, "Vigil: invalid slash percent");

        uint256 slashAmount = (bond.bondAmount * slashPercent) / 100;
        uint256 protocolFee = (slashAmount * protocolFeePercent) / 100;
        uint256 distributable = slashAmount - protocolFee;

        bond.bondAmount -= slashAmount;
        bond.status = BondStatus.SLASHED;

        // Distribute to followers proportionally
        address[] storage followers = traderFollowers[traderId];
        uint256 followerCount = followers.length;

        if (followerCount > 0) {
            uint256 perFollower = distributable / followerCount;
            for (uint256 i = 0; i < followerCount; i++) {
                followerStakes[traderId][followers[i]].earnedAmount += perFollower;
            }
        }

        // Protocol fee stays in contract for owner to withdraw
        emit BondSlashed(traderId, slashAmount, followerCount);
    }

    // ═══════════════════════════════════════════
    // OWNER FUNCTIONS
    // ═══════════════════════════════════════════

    /**
     * @notice Update the oracle address
     */
    function setOracle(address newOracle) external onlyOwner {
        emit OracleUpdated(oracle, newOracle);
        oracle = newOracle;
    }

    /**
     * @notice Withdraw accumulated protocol fees
     */
    function withdrawFees(uint256 amount) external onlyOwner nonReentrant {
        usdc.safeTransfer(owner, amount);
    }

    // ═══════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════

    function getTraderBond(uint256 traderId) external view returns (TraderBond memory) {
        return traderBonds[traderId];
    }

    function getFollowerStake(uint256 traderId, address follower) external view returns (FollowerStake memory) {
        return followerStakes[traderId][follower];
    }

    function getFollowers(uint256 traderId) external view returns (address[] memory) {
        return traderFollowers[traderId];
    }
}