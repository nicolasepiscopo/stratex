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

    uint256 public counter;
    AggregatorV3Interface internal priceFeed;
    address public constant routerAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    uint256[] public grids;
    mapping(uint256 => bool) private breachedGrids;
    uint256 public breachCounter;

    address public constant WMATIC = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889; // Polygon Network :
    address public constant WETH = 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa; // Polygon Network

    event GridBreached(uint256 gridIndex, bool isFirstBreach, uint256 price);


    //address public constant GETH  = 0xdD69DB25F6D620A7baD3023c5d32761D353D3De9 ; // Goerli ETH
    //address public constant GLINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; // goerli  LINK


    IERC20 public linkToken = IERC20(WMATIC);

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;

    constructor() {
        priceFeed = AggregatorV3Interface(
            0x0715A7794a1dc8e42615F059dD6e406A6594651A // ETH-USD in Mumbai Testnet
        );
        counter = 1337;
        grids = [1787, 1796, 1805, 1814, 1823, 1832, 1842];
        breachCounter = 0;
    }

    function checkUpkeep(bytes calldata ) external view override returns (bool upkeepNeeded, bytes memory performData)
    {
        uint price = getScaledPrice();
        for (uint256 i = 0; i < grids.length; i++) {
            if (price > grids[i] && !breachedGrids[i]) {
                upkeepNeeded = true;
                performData = abi.encode(i, true);
                break;
            } else if (price < grids[i] && breachedGrids[i]) {
                upkeepNeeded = true;
                performData = abi.encode(i, false);
                break;
            }
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        counter += 1;
        (uint256 i, bool isFirstBreach) = abi.decode(performData, (uint256, bool));
        if (isFirstBreach) {
            breachedGrids[i] = true;
            breachCounter++;
            emit GridBreached(i, true , getScaledPrice());
        } else {
            breachedGrids[i] = false;
            breachCounter--;
            emit GridBreached(i, false, getScaledPrice());
        }
    }


    function swapExactInputSingle(uint256 amountIn) external payable returns (uint256 amountOut)
    {
        linkToken.approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn:  WMATIC,
                tokenOut: WETH,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

       amountOut = swapRouter.exactInputSingle(params);
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