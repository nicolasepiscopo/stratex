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
        address owner;
        uint256[] grids;
        mapping(uint256 => bool) breachedGrids; // breachIndex => true/false
        uint256 breachCounter;
        bool isFirstBreach;
        uint256 buyCounter;
        uint256 sellCounter;
        mapping(uint256 => uint256) boughtAmounts; // breachIndex => amount
        uint256 lastExecutionTime;
    }

    struct User {
        bool onboarded;
        uint256 balanceWETH;
        uint256 balanceWMATIC;
    }

    struct PerformData {
        uint256 botId;
        uint256 breachIndex;
        bool isFirstBreach;
    }

    mapping(uint256 => Bot) bots; // uint256 woud be the botId
    mapping(address => User) public userData;  // address is the user address
    uint256 public botsCount = 0;
    
    uint256 private interval = 60;

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

    constructor() {
        priceFeed = AggregatorV3Interface(
            0x0715A7794a1dc8e42615F059dD6e406A6594651A // ETH-USD in Mumbai Testnet
        );
        // grids = [1787, 1796, 1805, 1814, 1823, 1832, 1842, 1862];
        // breachCounter = 0;
    }

    function createBot(uint256[] calldata _grids) external {
        require(
            userData[msg.sender].onboarded &&
            userData[msg.sender].balanceWMATIC > 0,
            "Insufficient balance"
        );
        Bot storage bot = bots[botsCount];
        bot.owner = msg.sender;
        bot.grids = _grids;
        botsCount += 1;
    }

    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory performData)
    {
        uint price = getScaledPrice();
        PerformData[] memory performDataUnencoded; // for each botId related the PerfomData
        upkeepNeeded = false;

        for (uint256 i = 0; i < botsCount; i++) {
            if (bots[i].grids.length > 0) {
                (bool _upkeepNeeded, uint256 breachIndex, bool isFirstBreach) = checkBots(i, price);
                if (_upkeepNeeded) {
                    performDataUnencoded[i] = PerformData(i, breachIndex, isFirstBreach);
                    upkeepNeeded = true;
                }
            }
        }
        if (upkeepNeeded) performData = abi.encode(performDataUnencoded, true);
        return (upkeepNeeded, performData); 
    }

    function checkBots(uint256 _botId, uint256 _price) view internal returns (bool upkeepNeeded, uint256 breachIndex, bool isFirstBreach) {
        uint256 minDistance = type(uint256).max;
        breachIndex = bots[_botId].grids.length;
        uint256 lastExecutionTime = bots[_botId].lastExecutionTime;
        uint256[] memory grids = bots[_botId].grids;
        for (uint256 i = 0; i < grids.length; i++) {
            uint256 distance = _price > grids[i] ? _price - grids[i] : grids[i] - _price;
            if (distance < minDistance) {
                minDistance = distance;
                breachIndex = i;
            } else { 
                break;
            } 
        }
        bool telapsed = (block.timestamp - lastExecutionTime) > interval;
        isFirstBreach = false;
        upkeepNeeded = false;
        if (minDistance <= 2 && telapsed) { // In vicinity of 0.10% of the Grid
            if (!bots[_botId].breachedGrids[breachIndex]) {
                upkeepNeeded = true;
                isFirstBreach = true;
            } else {
                upkeepNeeded = true;
                isFirstBreach = false;
            }
        }
        return (upkeepNeeded, breachIndex, isFirstBreach);
    }

    function performUpkeep(bytes calldata performData) external override {
        // Check gas that this performUpKeep can consume to not to consume more than the gas limit
        // in that case the logic will be the same but we could have some proxy and manage the bots using
        // groups or batches 
        PerformData[] memory performDataUnencoded = abi.decode(performData, (PerformData[]));

        for (uint256 i; i < performDataUnencoded.length; i++) {
            PerformData memory performDataIndividual = performDataUnencoded[i];
            Bot storage bot = bots[performDataIndividual.botId];
            User storage user = userData[bot.owner];
            bot.isFirstBreach = performDataIndividual.isFirstBreach;
            uint256 breachIndex = performDataIndividual.breachIndex;
            if (performDataIndividual.isFirstBreach) { // This needs to fixed maybe add same sell code in else part 
                bot.breachedGrids[breachIndex] = true;
                bot.breachCounter++; 
                // Perform Buy if there is no Order placed in n-1 grid , else Sell
                if (breachIndex > 0 && !bot.breachedGrids[breachIndex - 1]) {
                    _buyOrder(breachIndex, bot, user);
                } else {
                    _sellOrder(breachIndex, bot, user);
                }
            } else {
                if (bot.breachedGrids[breachIndex  - 1]){
                    _sellOrder(breachIndex, bot, user);
                }
            }
            bot.lastExecutionTime = block.timestamp;
        }
    }

    function _buyOrder(uint256 _breachedIndex, Bot storage _bot, User storage _user) internal {
        uint256 availableBalance = _user.balanceWMATIC;
        _bot.buyCounter++;
        uint256 qty = swapExactInputSingle(availableBalance, WMATIC, WETH);
        _bot.boughtAmounts[_breachedIndex] = qty; // This quantity will come from exactInputSingle() call
        _user.balanceWMATIC -= availableBalance;
        _user.balanceWETH += qty;
        emit GridBreached(_breachedIndex, true , qty, getScaledPrice());
    }

    function _sellOrder(uint256 _breachedIndex, Bot storage _bot, User memory _user) internal {
        uint256 amountToSell = _bot.boughtAmounts[_breachedIndex - 1];
        if (amountToSell > 0) {
            delete _bot.boughtAmounts[_breachedIndex - 1];
            delete _bot.breachedGrids[_breachedIndex - 1];
            _bot.sellCounter++;
            uint256 qty = swapExactInputSingle(amountToSell, WETH, WMATIC);
            _user.balanceWETH -= amountToSell;
            _user.balanceWMATIC += qty;
            emit GridBreached(_breachedIndex, false, amountToSell, getScaledPrice());
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

    function depositWmatic(uint256 amount) external {
        User storage user = userData[msg.sender];
        IERC20(WMATIC).transferFrom(msg.sender, address(this), amount);
        // check if sender exists, if not create and assign balance
        if (user.onboarded) {
            user.balanceWMATIC += amount;
        } else {
            user.onboarded = true;
            user.balanceWMATIC = amount;
        }
    }
    
    function withdrawWmatic(uint256 amount) public {
        User storage user = userData[msg.sender];
        require(user.onboarded && user.balanceWMATIC >= amount, "Insufficient balance");
        require(IERC20(WMATIC).balanceOf(address(this)) >= amount, "Insufficient balance");        
        IERC20(WMATIC).transfer(msg.sender, amount);
        user.balanceWMATIC -= amount;
    }

    function withdrawWeth(uint256 amount) public {
        User storage user = userData[msg.sender];
        require(user.onboarded && user.balanceWETH >= amount, "Insufficient balance");
        require(IERC20(WMATIC).balanceOf(address(this)) >= amount, "Insufficient balance");        
        IERC20(WMATIC).transfer(msg.sender, amount);
        user.balanceWETH -= amount;
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