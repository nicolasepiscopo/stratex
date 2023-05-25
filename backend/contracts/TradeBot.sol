pragma solidity ^0.8.7;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract SingleSwap is AutomationCompatibleInterface {
    AggregatorV3Interface internal priceFeed;
    address public constant routerAddress =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    uint256[] public grids;
    mapping(uint256 => bool) private breachedGrids;
    uint256 public breachCounter;
    uint256 public buyCounter;
    uint256 public sellCounter;
    mapping(uint256 => uint256) boughtAmounts;
    uint256 private lastExecutionTime;
    uint256 private interval = 60;

    address public tokenin; // Polygon Network - tokenin:
    address public tokenout; // Polygon Network - tokenout
    mapping(string => address) getpooladdressfromname;
    mapping(uint256 => uint256) orderidtobreachcounter;
    event GridBreached(
        uint256 gridIndex,
        bool isFirstBreach,
        uint256 qty,
        uint256 price
    );
    event BytesFailure(bytes bytesFailure);
    event StringFailure(string stringFailure);

    //address public constant GETH  = 0xdD69DB25F6D620A7baD3023c5d32761D353D3De9 ; // Goerli ETH
    //address public constant GLINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; // goerli  LINK

    IERC20 public linkToken = IERC20(tokenin);

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;

    constructor() {
        // getpooladdressfromname[
        //     "WETH"
        // ] = 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa;
        // getpooladdressfromname[
        //     "WMATIC"
        // ] = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889;
        // getpooladdressfromname[
        //     "USDC"
        // ] = 0xe11A86849d99F524cAC3E7A0Ec1241828e332C62;
        priceFeed = AggregatorV3Interface(
            0x0715A7794a1dc8e42615F059dD6e406A6594651A // ETH-USD in Mumbai Testnet
        );
    }

    mapping(uint256 => mapping(uint256 => address)) orderidtotokenaddress;
    mapping(uint256 => mapping(uint256 => uint256)) orderidtogrids;

    // constructor()

    function initialiseOrder(
        uint256 _orderid,
        address tokenincoming,
        address tokenoutgoing,
        uint256 lower_range,
        uint256 upper_range,
        uint256 no_of_grids
    ) public {
        orderidtotokenaddress[_orderid][0] = tokenincoming;
        orderidtotokenaddress[_orderid][1] = tokenoutgoing;
        orderidtobreachcounter[_orderid] = 0;
        // uint256 len=ordergrids.length;
        // for(uint i=0;i<len;i++){
        //     orderidtogrids[_orderid][i]=ordergrids[i];
        // }
        uint256 dist = (upper_range - lower_range) / no_of_grids;
        uint k = 0;
        for (uint i = 0; i <= no_of_grids; i++) {
            orderidtogrids[_orderid][i] = lower_range + k;
            k = k + dist;
        }
    }

    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint price = getScaledPrice();
        uint256 minDistance = type(uint256).max;
        uint256 breachIndex = grids.length;
        for (uint256 i = 0; i < grids.length; i++) {
            uint256 distance = price > grids[i]
                ? price - grids[i]
                : grids[i] - price;
            if (distance < minDistance) {
                minDistance = distance;
                breachIndex = i;
            }
        }
        bool telapsed = (block.timestamp - lastExecutionTime) > interval;
        if (minDistance <= 2 && telapsed) {
            // In vicinity of 0.10% of the Grid
            if (!breachedGrids[breachIndex]) {
                upkeepNeeded = true;
                performData = abi.encode(breachIndex, true);
            } else {
                upkeepNeeded = true;
                performData = abi.encode(breachIndex, false);
            }
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 amountToSell = 0;
        (uint256 breachedIndex, bool isFirstBreach, uint256 orderid) = abi
            .decode(performData, (uint256, bool, uint256));
        if (isFirstBreach) {
            // This needs to fixed maybe add same sell code in else part
            breachedGrids[breachedIndex] = true;
            orderidtobreachcounter[orderid]++;
            // breachCounter++;
            // Perform Buy if there is no Order placed in n-1 grid , else Sell
            if (
                (breachedIndex > 0 && !breachedGrids[breachedIndex - 1]) ||
                (breachedIndex == 0) // should buy token even if it is at starting grids
            ) {
                buyCounter++;
                uint256 qty = swapExactInputSingle(
                    150000000000000000,
                    orderidtotokenaddress[orderid][0],
                    orderidtotokenaddress[orderid][1]
                );
                //swap like sample
                // uint256 qty = swapExactInputSingle(
                //     150000000000000000,
                //     orderidtotokenaddress[_orderid][0],
                //     orderidtotokenaddress[_orderid][1]
                // );
                boughtAmounts[breachedIndex] = qty; // This quantity will come from exactInputSingle() call
                emit GridBreached(breachedIndex, true, qty, getScaledPrice());
            } else {
                amountToSell = boughtAmounts[breachedIndex - 1];
                if (amountToSell > 0) {
                    delete boughtAmounts[breachedIndex - 1];
                    delete breachedGrids[breachedIndex - 1];
                    sellCounter++;
                    swapExactInputSingle(
                        amountToSell,
                        orderidtotokenaddress[orderid][1],
                        orderidtotokenaddress[orderid][0]
                    );
                    emit GridBreached(
                        breachedIndex,
                        false,
                        amountToSell,
                        getScaledPrice()
                    );
                }
            }
        } else {
            if (breachedIndex > 0 && breachedGrids[breachedIndex - 1]) {
                amountToSell = boughtAmounts[breachedIndex - 1];
                if (amountToSell > 0) {
                    delete boughtAmounts[breachedIndex - 1];
                    delete breachedGrids[breachedIndex - 1];
                    sellCounter++;
                    swapExactInputSingle(
                        amountToSell,
                        orderidtotokenaddress[orderid][1],
                        orderidtotokenaddress[orderid][0]
                    );
                    // swapExactInputSingle(
                    // 150000000000000000,
                    // orderidtotokenaddress[_orderid][1],
                    // orderidtotokenaddress[_orderid][0]
                    // );
                    emit GridBreached(
                        breachedIndex,
                        false,
                        amountToSell,
                        getScaledPrice()
                    );
                }
            }
        }
        lastExecutionTime = block.timestamp;
    }

    function swapExactInputSingle(
        uint256 amountIn,
        address tin,
        address tout
    ) public payable returns (uint256 amountOut) {
        linkToken.approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tin,
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
        } catch (bytes memory error) {
            emit BytesFailure(error);
        }
    }

    function testing(address k) public pure returns (uint256) {
        return 10;
    }

    function getTokenIn(uint256 orderid) public view returns (address) {
        return orderidtotokenaddress[orderid][0];
    }

    function withdraw() public {
        address payable to = payable(msg.sender);
        uint256 balance = address(this).balance;
        to.transfer(balance);
    }

    function deposittokenin(uint256 amount) public payable {
        require(msg.value == 0, "ETH not accepted");
        IERC20(tokenin).transferFrom(msg.sender, address(this), amount);
    }

    function withdrawtokenin(uint256 amount) public {
        require(
            IERC20(tokenin).balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );
        IERC20(tokenin).transfer(msg.sender, amount);
    }

    function payContract() public payable {
        // No need of code
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getAllowance() public view returns (uint) {
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
            ,
            /* uint80 roundID */ int price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = priceFeed.latestRoundData();
        return price;
    }

    function getScaledPrice() public view returns (uint256) {
        int price = getOraclePrice();
        uint8 decimals = getDecimals();
        uint256 convertedPrice = uint256(price) / (10 ** uint256(decimals));
        return convertedPrice;
    }

    function deleteOrder(uint256 orderid) public {
        // orderidtogrids[orderid]=0;
        delete orderidtotokenaddress[orderid][0];
        delete orderidtotokenaddress[orderid][1];
        uint i = 0;
        while (orderidtogrids[orderid][i] != 0) {
            delete orderidtogrids[orderid][i];
            i++;
        }
    }

    // have a function to terminate a order which should be called by the FE to delete a orderid
    // it should also delete a event like order deleted()

    receive() external payable {}
}
