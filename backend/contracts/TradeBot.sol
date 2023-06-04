pragma solidity ^0.8.7;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
// import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SingleSwap is AutomationCompatibleInterface {

    AggregatorV3Interface internal priceFeed;
    address public constant routerAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    uint256 public constant balanceToSpentBPS = 2500; // 25% of the balance will be used to make the swappings

    struct Bot {
        address user;
        uint256 upper_range;
        uint256 lower_range;
        uint256[] grids;
        uint256 currentGrid;
        uint256 buyCounter;
        uint256 sellCounter;
        uint256 lastExecutionTime;
        bool isCancelled;
    }
    Bot[] public bots;
    uint256 public botCounter = 0;
    enum OrderType {
        BuyOrder, 
        SellOrder,
        UpdateCurrentGrid    
    }
    struct PerformData {
        uint256 botId;
        uint256 breachIndex;
        OrderType orderType;
    }
 
    //Bot ID => breachIndex => isbreached
    mapping(uint256 => mapping(uint256 => bool)) breachedBotGrids;
    mapping(uint256 => mapping(uint256 => uint256)) boughtBotAmounts;

    mapping(address => uint256) public balanceWMATIC;
    mapping(address => uint256)  public balanceWETH;

    uint256 private interval = 60;


    address public constant WMATIC = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889; // Polygon Network :
    address public constant WETH = 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa; // Polygon Network

    event OrderExecuted(OrderType ordertype, uint256 gridIndex, uint256 qty , uint256 price);
    event BytesFailure(bytes bytesFailure);
    event StringFailure(string stringFailure);
    event Test(uint256 test, uint256 test2, OrderType ordertype);

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;

    function CreateBot(uint256 _upper_range , uint256 _lower_range, uint256 _no_of_grids, uint256 _amount, uint256 currentPrice) public {
        // uint256 currentPrice = getScaledPrice();
        // require(currentPrice >= _lower_range, "current price should be greater than lower range");
        // IERC20(WMATIC).transferFrom(msg.sender, address(this), _amount);
        balanceWMATIC[msg.sender] += _amount;
        uint256[] memory grids;
        Bot memory newBot = Bot({
            user: msg.sender,
            upper_range: _upper_range,
            lower_range: _lower_range,
            grids: grids,
            currentGrid: 0,
            buyCounter: 0,
            sellCounter: 0,
            lastExecutionTime: block.timestamp,
            isCancelled: false
        });       
        bots.push(newBot);
        uint256 dist = (_upper_range - _lower_range) / _no_of_grids;
        uint256 k = 0;
        for (uint256 i = 0; i <= _no_of_grids; i++) {
            bots[botCounter].grids.push(_lower_range + k);
            k = k + dist;
        }

        bots[botCounter].currentGrid = calculateGrid(bots[botCounter].grids, currentPrice);

        botCounter ++;
    }

    function getGrids(uint256 _botIndex) public view returns (uint256[] memory _grids)  {
        return bots[_botIndex].grids;
    }

    function getGrids2(uint256 _botIndex, uint256 _grid) public view returns (uint256 gridd) {
        return bots[_botIndex].grids[_grid];
    }

    constructor() {
        priceFeed = AggregatorV3Interface(
            0x0715A7794a1dc8e42615F059dD6e406A6594651A // ETH-USD in Mumbai Testnet
        );
    }

    // ** modify to internal after tests
    function calculateGrid(uint256[] memory grids, uint256 _currentPrice) public pure returns (uint256 _currentGrid) {
        // Add grid below lower range (0) and upper range (grids.length + 1)
        for (uint256 i = 0; i < grids.length; i++) {
            if (i == 0 && _currentPrice < grids[i]) return i;
            if (i == (grids.length - 1) && _currentPrice > grids[i]) return (i + 1);
            if (_currentPrice >= grids[i] && _currentPrice < grids[i + 1]) return (i + 1);
        }
    }

    function checkUpkeep(bytes calldata checkData) external view override returns (bool upkeepNeeded, bytes memory performData)
    {
        PerformData[] memory performDataUnencoded = new PerformData[](botCounter); // for each botId related the PerfomData
        upkeepNeeded = false;

        (uint256 price) = abi.decode(
            checkData,
            (uint256)
        );

        // uint price = getScaledPrice();
        for (uint256 i = 0; i < botCounter; i++) {
            if (bots[i].upper_range == 0) continue; // bots[] can be deleted so to avoid processing empty voids we put this control
            uint256 newGrid = calculateGrid(bots[i].grids, price);
            if((bots[i].buyCounter - bots[i].sellCounter) == 1 && newGrid > bots[i].currentGrid) {
                if ( bots[i].sellCounter > 0) {
                    // put sell order. If 0, it means that the bot has not started yet (any buy order placed)
                    performDataUnencoded[i] = PerformData(i, newGrid, OrderType.SellOrder);
                    upkeepNeeded = true;
                }
            }
            if((bots[i].buyCounter - bots[i].sellCounter) > 0 && newGrid > (bots[i].currentGrid + 1)) { // if price go up fast => sell
                if ( bots[i].buyCounter > 0) {
                    // put sell order. If 0, it means that the bot has not started yet (any buy order placed)
                    performDataUnencoded[i] = PerformData(i, newGrid, OrderType.SellOrder);
                    upkeepNeeded = true;
                }
            }
            if(newGrid < bots[i].currentGrid) {
                // put buy order
                performDataUnencoded[i] = PerformData(i, newGrid, OrderType.BuyOrder);
                upkeepNeeded = true;
            }
            if (!upkeepNeeded && newGrid != bots[i].currentGrid) {
                performDataUnencoded[i] = PerformData(i, newGrid, OrderType.UpdateCurrentGrid);
                upkeepNeeded = true;
            }
        }
        if (upkeepNeeded) performData = abi.encode(performDataUnencoded);
        return (upkeepNeeded, performData); 
    }

    function performUpkeep(bytes calldata performData) external override {
        // uint256 price = getScaledPrice();
        uint256 price = 1500;
        PerformData[] memory performDataDecoded = abi.decode(performData, (PerformData[]));
        for (uint256 i = 0; i < performDataDecoded.length; i++) {
            PerformData memory performDataIndividual = performDataDecoded[i];
            uint256 botId = performDataIndividual.botId;
            uint256 breachIndex = performDataIndividual.breachIndex;
            OrderType orderType = performDataIndividual.orderType;
            // emit Test(botId, breachIndex, orderType);
            Bot storage bot = bots[botId];
            if(orderType == OrderType.BuyOrder) {
                // BUY
                uint256 amountToSwap = (balanceWMATIC[bot.user] * balanceToSpentBPS) / 10000;
                uint256 qty = swapExactInputSingle(amountToSwap, WMATIC, WETH);
                balanceWMATIC[bot.user] -= amountToSwap;
                balanceWETH[bot.user] += qty;
                bot.buyCounter++;
                emit OrderExecuted(orderType, breachIndex, qty, price);
            }
            if(orderType == OrderType.SellOrder) {
                // SELL
                uint256 amountToSwap = (balanceWETH[bot.user] * balanceToSpentBPS) / 10000;
                uint256 qty = swapExactInputSingle(amountToSwap, WMATIC, WETH);
                balanceWMATIC[bot.user] += amountToSwap;
                balanceWETH[bot.user] -= qty;
                bot.sellCounter++;
                emit OrderExecuted(orderType, breachIndex, qty, price);
            }
            bot.lastExecutionTime = block.timestamp;
            bot.currentGrid = breachIndex;
        }
    }


    function swapExactInputSingle(uint256 amountIn, address tin , address tout) public payable returns (uint256 amountOut)
    {
        if (tin == WMATIC) {
            // Approve the router to spend DAI.
            // TransferHelper.safeApprove(WMATIC, address(swapRouter), amountIn);
            IERC20(WMATIC).approve(address(swapRouter), amountIn);
        } else {
            IERC20(WETH).approve(address(swapRouter), amountIn);
        }

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn:  tin,
                tokenOut: tout,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

       //amountOut = swapRouter.exactInputSingle(params);
       try swapRouter.exactInputSingle(params) returns (uint256 _value) {
           // Successful execution, proceed with the rest of the code
           return (_value);
       } catch Error(string memory _err) {
           emit StringFailure(_err);
       }
       catch (bytes memory error) {
           emit BytesFailure(error);
       }
    }
    
    function withdrawWmatic(uint256 _amount) public {
        require(balanceWMATIC[msg.sender] >= _amount, "Insufficient balance");
        require(IERC20(WMATIC).balanceOf(address(this)) >= _amount, "Insufficient balance");        
        IERC20(WMATIC).transfer(msg.sender, _amount);
        balanceWMATIC[msg.sender] -= _amount;
    }

    function withdrawWeth(uint256 _amount) public {
        require(balanceWETH[msg.sender] >= _amount, "Insufficient balance");
        require(IERC20(WETH).balanceOf(address(this)) >= _amount, "Insufficient balance");        
        IERC20(WETH).transfer(msg.sender, _amount);
        balanceWETH[msg.sender] -= _amount;
    }

    function getDecimals() public view returns (uint8) {
        return priceFeed.decimals();
    }

    function getOraclePrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function getScaledPrice() public view returns (uint256) {
        int price = getOraclePrice();
        uint8 decimals = getDecimals();
        uint256 convertedPrice = uint256(price) / (10**uint256(decimals));
        return convertedPrice;
    }

     // function to cancel/resume bot execution
    function toggleBot(uint256 botIndex) external {
        require(bots[botIndex].user == msg.sender, "Only user can toogle");
        Bot storage bot = bots[botIndex];
        bot.isCancelled = !bot.isCancelled;
    }

    function deleteBot(uint256 botIndex) external {
        require(bots[botIndex].user == msg.sender, "Only user can toogle");
        delete bots[botIndex];
    }
    
}