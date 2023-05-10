// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.7;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

contract SingleSwap is AutomationCompatibleInterface {

    // We need to set up limits for the batches
    // SIZE => batch length
    // LIMIT => we could limit the amount locked in the contract
    uint256 public constant SIZE = 5;
    uint256 public constant LIMIT = 10;
    uint256[SIZE] public balances;

    // interface for price data feed
    AggregatorV3Interface internal priceFeed;
    uint8 decimals = 8;

    //logic data
    address private owner;
    struct GridSetting {
        uint256 balanceStable;   // balance WBTC
        uint256 balanceTarget;   // balance USDC
        uint256[] targets;       // each limit is reflected
        uint256 lastTarget;      
    }
    //mapping storaging the user address, inside nested, the tx ID for that user related to a GridSetting
    mapping (address => mapping(uint256 => GridSetting)) gridsState;


    //swap data
    address public constant routerAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    address public constant LINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address public constant WETH = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;

    IERC20 public linkToken = IERC20(LINK);

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;


    constructor() {
        owner = msg.sender; //or we can use openzeppeling onlyowner library
        priceFeed = AggregatorV3Interface(
            0x007A22900a3B98143368Bd5906f8E17e9867581b // BTC/USD
        );
    }

    function getBalance(uint i) public view returns (uint256) {
        return balances[i];
    }

    //logic functions
    function callToAction(uint256 _currentPrice, address _swapOnwer, uint256 _swapOrder) public {
        require(msg.sender == owner, 'Only owner can call this function');
        GridSetting memory grid = gridsState[_swapOnwer][_swapOrder];
        //if new price is higher --- must sell
        if(_currentPrice > grid.lastTarget){
            //TOdo call sell function
            gridsState[_swapOnwer][_swapOrder].lastTarget = _currentPrice;
            //TOdo adjust balance for Stable and Target tokens;
        }
        //if new price is lower -- must purchase new tokens
        else {
            //TOdo call purchase function
            gridsState[_swapOnwer][_swapOrder].lastTarget = _currentPrice;
            //TOdo adjust balance for Stable and Target tokens;
        }
    }

    // function initializeGridSetting() public {}

    // function getBotsByUser(address user) public {}  // return botIds

    // function getBotDetail(botId) public {}

    // function stopBot(botId) public {}

    // function getBotTransactions(botId) public {}

    function readLastPos (address _swapOnwer, uint256 _swapOrder) public view returns (uint256) {
        return gridsState[_swapOnwer][_swapOrder].lastTarget;
    }
    function getStableBalance (address _swapOnwer, uint256 _swapOrder) public view returns (uint256) {
        return gridsState[_swapOnwer][_swapOrder].balanceStable;
    }
    function getTargetBalance (address _swapOnwer, uint256 _swapOrder) public view returns (uint256) {
        return gridsState[_swapOnwer][_swapOrder].balanceTarget;
    }
    function getTargets (address _swapOnwer, uint256 _swapOrder) public view returns (uint256[] memory) {
        return gridsState[_swapOnwer][_swapOrder].targets;
    }
    //swap functions
    function swapExactInputSingle(uint256 amountIn)
        external
        returns (uint256 amountOut)
    {
        linkToken.approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: LINK,
                tokenOut: WETH,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = swapRouter.exactInputSingle(params);

        // TOdo - emit event for tracking transactions later to be gathered later
    }

    function swapExactOutputSingle(uint256 amountOut, uint256 amountInMaximum)
        external
        returns (uint256 amountIn)
    {
        linkToken.approve(address(swapRouter), amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: LINK,
                tokenOut: WETH,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        amountIn = swapRouter.exactOutputSingle(params);

        if (amountIn < amountInMaximum) {
            linkToken.approve(address(swapRouter), 0);
            linkToken.transfer(address(this), amountInMaximum - amountIn);
        }
    }

    function checkUpkeep(
        bytes memory checkData // could contain the harcoded
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Keepers could be organized in batches, so as input data we could have
        // the initial and final indexes related to the batch
        (uint256 initialIndex, uint256 finalIndex) = abi.decode(
            checkData,
            (uint256, uint256)
        );

        // we can "simulate" orders that need to be executed
        uint256 counter;
        
        for (uint256 i = 0; i < finalIndex - initialIndex + 1; i++) {
            if (balances[initialIndex + i] < LIMIT) {
                counter++;
            }
        }
        upkeepNeeded = false;
        uint256[] memory indexes = new uint256[](counter); // an array of orderId
        uint256 indexCounter;
        for (uint256 i = 0; i < finalIndex - initialIndex + 1; i++) {
            if (balances[initialIndex + i] < LIMIT) {
                // int price = getLatestPrice();
                // bool condition = (balances[initialIndex + i] == LIMIT - 1)  && (balances[initialIndex + i]);
                upkeepNeeded = (balances[initialIndex + i] == LIMIT - 1) ? false : true;
                // store the index that will be passed to performUpKeep the growing up
                // indexes[indexCounter] = initialIndex + i;
                indexes[indexCounter] = initialIndex + i;
                indexCounter++;
            }
        }
        
        performData = abi.encode(indexes);
        return (upkeepNeeded, performData); 
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory indexes) = abi.decode(
            performData,
            (uint256[])
        );
        // important to always check that the data provided by the Automation Node is not corrupted.
        // here we can pass the indexes that points to the orderId that needs to swap
        uint256 _balance;
        for (uint256 i = 0; i < indexes.length; i++) {
            _balance = balances[indexes[i]] + 1;
            // important to always check that the data provided by the Automation Nodes is not corrupted. Here we check that after rebalancing, the balance of the element is equal to the LIMIT
            if (_balance < LIMIT) balances[indexes[i]] = _balance;            
        }
    }

    function getLatestPrice() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData(); // take care about decimals
        return price;
    }

}