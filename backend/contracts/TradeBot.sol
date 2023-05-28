pragma solidity ^0.8.7;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
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

    struct Bot {
        uint256 upper_range;
        uint256 lower_range;
        uint256[] grids;
        uint256 breachCounter;
        uint256 buyCounter;
        uint256 sellCounter;
        uint256 lastExecutionTime;
        bool isCancelled;
    }
    Bot[] userBots;
    uint256 botCounter = 0;
    struct PerformData {
        uint256 botId;
        uint256 breachIndex;
        bool isFirstBreach;
    }
    //Bot ID => breachIndex => isbreached
    mapping(uint256 => mapping(uint256 => bool)) breachedBotGrids;
    mapping(uint256 => mapping(uint256 => uint256)) boughtBotAmounts;




    uint256[] public grids;
    mapping(uint256 => bool) private breachedGrids;
    uint256 public breachCounter;
    uint256 public buyCounter;
    uint256 public sellCounter;
    mapping(uint256 => uint256) boughtAmounts;
    uint256 private lastExecutionTime;
    uint256 private interval = 60;

    uint256 public upper_range;
    uint256 public lower_range;
    uint256 public no_of_grids;
    uint256 public amount;

    address public constant WMATIC = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889; // Polygon Network :
    address public constant WETH = 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa; // Polygon Network

    event GridBreached(uint256 gridIndex, bool isFirstBreach, uint256 qty ,uint256 price);
    event BytesFailure(bytes bytesFailure);
    event StringFailure(string stringFailure);


    //address public constant GETH  = 0xdD69DB25F6D620A7baD3023c5d32761D353D3De9 ; // Goerli ETH
    //address public constant GLINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; // goerli  LINK


    IERC20 public linkToken = IERC20(WMATIC);

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;


    function getBotsDetails()  public view returns (uint256 _upper_range , uint256 _lower_range, uint256 _no_of_grids, uint256 _amount, address tokeIn ,address tokenOut) {
        return (upper_range, lower_range, no_of_grids, amount, WMATIC , WETH);
    }

    function CreateBot(uint256 _upper_range , uint256 _lower_range, uint256 _no_of_grids, uint256 _amount) public {

        amount  = _amount;
        //IERC20(WMATIC).approve(msg.sender, amount);
        //IERC20(WMATIC).transferFrom(msg.sender, address(this), amount);
        mapping(uint256 => bool) memory initialMapping;
        initialMapping[0] = false;
        Bot memory newBot = Bot({
            upper_range: _upper_range,
            lower_range: _lower_range,
            grids: new uint256[](_no_of_grids),
            breachCounter: 0,
            buyCounter: 0,
            sellCounter: 0,
            lastExecutionTime: block.timestamp,
            isCancelled: false
        });
        userBots.push(newBot);
        uint256 dist = (_upper_range - _lower_range) / _no_of_grids;
        uint256 k = 0;
        for (uint256 i = 0; i < _no_of_grids; i++) {
            userBots[botCounter].grids.push(_lower_range + k);
            k = k + dist;
        }
        botCounter ++;
    }

    function getGrids(uint256 _botIndex) public view returns (uint256[] memory _grids)  {
        return userBots[_botIndex].grids;
    }

    constructor() {
        priceFeed = AggregatorV3Interface(
            0x0715A7794a1dc8e42615F059dD6e406A6594651A // ETH-USD in Mumbai Testnet
        );
        //grids = [1787, 1796, 1805, 1814, 1823, 1832, 1842, 1862];
        breachCounter = 0;
    }

    function checkUpkeep(bytes calldata ) external view override returns (bool upkeepNeeded, bytes memory performData)
    {
        PerformData[] memory performDataUnencoded; // for each botId related the PerfomData
        upkeepNeeded = false;

        uint price = getScaledPrice();
        for (uint256 i = 0; i < botCounter; i++) {
            if(userBots[i].grids.length == 0 || !userBots[i].isCancelled) {
                (bool _upkeepNeeded, uint256 breachIndex, bool isFirstBreach) = checkBots(i, price);
                if (_upkeepNeeded) {
                    performDataUnencoded[i] = PerformData(i, breachIndex, isFirstBreach);
                    upkeepNeeded = true;
                }
            }
        }
        if (upkeepNeeded) performData = abi.encode(performDataUnencoded);
        return (upkeepNeeded, performData); 

        // if (grids.length == 0) {
        //     upkeepNeeded = false;
        //     return (upkeepNeeded, performData); 
        // }
        // uint price = getScaledPrice();
        // uint256 minDistance = type(uint256).max;
        // uint256 breachIndex = grids.length;
        // for (uint256 i = 0; i < grids.length; i++) {
        //     uint256 distance = price > grids[i] ? price - grids[i] : grids[i] - price;
        //     if (distance < minDistance) {
        //         minDistance = distance;
        //         breachIndex = i;
        //     }
        // }
        // bool telapsed = (block.timestamp - lastExecutionTime) > interval;
        // if (minDistance <= 2 && telapsed) { // In vicinity of 0.10% of the Grid
        //     if (!breachedGrids[breachIndex]) {
        //         upkeepNeeded = true;
        //         performData = abi.encode(breachIndex, true);
        //     } else {
        //         upkeepNeeded = true;
        //         performData = abi.encode(breachIndex, false);
        //     }
        // }
    }
    function checkBots(uint256 _botId, uint256 _price) internal view returns (bool upkeepNeeded, uint256 breachIndex, bool isFirstBreach) {

        uint256 minDistance = type(uint256).max;
        uint256 breachIndex = userBots[_botId].grids.length;

        for (uint256 i = 0; i < userBots[_botId].grids.length; i++) {
            uint256 distance = _price > userBots[_botId].grids[i] ? 
                _price - userBots[_botId].grids[i] 
                : 
                userBots[_botId].grids[i] - _price;
            if (distance < minDistance) {
                minDistance = distance;
                breachIndex = i;
            }
        }
        bool telapsed = (block.timestamp - userBots[_botId].lastExecutionTime) > interval;
        isFirstBreach = false;
        upkeepNeeded = false;
        if (minDistance <= 2 && telapsed) { // In vicinity of 0.10% of the Grid
            if (!breachedBotGrids[_botId][breachIndex]) {
                upkeepNeeded = true;
                isFirstBreach = true;
            } else {
                upkeepNeeded = true;
                isFirstBreach = false;
            }
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 amountToSell = 0;
        //(uint256 breachedIndex, bool isFirstBreach) = abi.decode(performData, (uint256, bool));
        PerformData[] memory performDataDecoded = abi.decode(performData, (PerformData[]));
        for (uint256 i = 0; i < performDataDecoded.length; i++) {
            PerformData memory performDataIndividual = performDataDecoded[i];
            uint256 botId = performDataIndividual.botId;
            uint256 breachIndex = performDataIndividual.breachIndex;
            Bot storage bot = userBots[botId];
            if (performDataIndividual.isFirstBreach) { // This needs to fixed maybe add same sell code in else part 
                breachedBotGrids[botId][breachIndex] = true;
                userBots[botId].breachCounter ++;
                //breachedGrids[breachedIndex] = true;
                //breachCounter++; 

                // Perform Buy if there is no Order placed in n-1 grid , else Sell
                if (breachIndex > 0 && !breachedBotGrids[botId][breachIndex - 1]) {
                    userBots[botId].buyCounter++;
                    uint256 qty = swapExactInputSingle(150000000000000000, WMATIC, WETH);
                    boughtBotAmounts[botId][breachIndex] = qty;
                    //boughtAmounts[breachedIndex] = qty; // This quantity will come from exactInputSingle() call
                    emit GridBreached(breachIndex, true , qty, getScaledPrice());
                    //=======> FOR THE EVENT WE WOULD NEED TO ADD THE BOTINDEX
                } else {
                    amountToSell = boughtBotAmounts[botId][breachIndex - 1];
                    //amountToSell = boughtAmounts[breachedIndex - 1];
                    if (amountToSell > 0) {
                        delete boughtBotAmounts[botId][breachIndex - 1];
                        delete breachedBotGrids[botId][breachIndex - 1];
                        // delete boughtAmounts[breachedIndex - 1];
                        // delete breachedGrids[breachedIndex - 1];
                        userBots[botId].sellCounter++;
                        swapExactInputSingle(amountToSell, WETH, WMATIC);
                        emit GridBreached(breachIndex, false, amountToSell, getScaledPrice());
                        //=======> FOR THE EVENT WE WOULD NEED TO ADD THE BOTINDEX
                    }
                }
            } else {
                if (breachedBotGrids[botId][breachIndex - 1]){
                    amountToSell = boughtBotAmounts[botId][breachIndex - 1];
                    if (amountToSell > 0) {
                        delete boughtBotAmounts[botId][breachIndex - 1];
                        delete breachedBotGrids[botId][breachIndex - 1];
                        // delete boughtAmounts[breachedIndex - 1];
                        // delete breachedGrids[breachedIndex - 1];
                        userBots[botId].sellCounter++;
                        swapExactInputSingle(amountToSell, WETH, WMATIC);
                        emit GridBreached(breachIndex, false, amountToSell, getScaledPrice());
                    }
                }
            }
            userBots[botId].lastExecutionTime = block.timestamp;
        }
    }


    function swapExactInputSingle(uint256 amountIn, address tin , address tout) public payable returns (uint256 amountOut)
    {
        linkToken.approve(address(swapRouter), amountIn);

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

    function withdraw() public  {
        address payable to = payable(msg.sender);
        uint256 balance = address(this).balance;
        to.transfer(balance);
    }

     function depositWmatic(uint256 amount) public payable {
        require(msg.value == 0, "ETH not accepted");
        IERC20(WMATIC).transferFrom(msg.sender, address(this), amount);
    }
    
    function withdrawWmatic(uint256 amount) public {
        require(IERC20(WMATIC).balanceOf(address(this)) >= amount, "Insufficient balance");        
        IERC20(WMATIC).transfer(msg.sender, amount);
    }


    function payContract() public payable {
        // No need of code 
    }

    function getBalance() view public returns (uint) {
        return address(this).balance;
    }

    function getAllowance() view public returns (uint) {
        return linkToken.allowance(address(this), address(swapRouter));
    }

    function setAllowance() public {
        linkToken.approve(address(swapRouter), 5000000000000000000);
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

    receive() payable external {}
}