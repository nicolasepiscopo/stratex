// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "https://github.com/Uniswap/v3-periphery/blob/main/contracts/interfaces/ISwapRouter.sol";


interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

contract SingleSwap {
    //logic data
    address private owner;
    struct GridSetting {
        uint256 balanceStable;
        uint256 balanceTarget;
        uint256[] targets;
        uint256 lastTarget;
    }
    //mapping storaging the user address, inside nested, the tx ID for that user related to a GridSetting
    mapping (address => mapping(uint256 => GridSetting)) gridsState;


    //swap data
    address public constant routerAddress =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    address public constant LINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address public constant WETH = 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6;

    IERC20 public linkToken = IERC20(LINK);

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;


    constructor() {
        owner = msg.sender; //or we can use openzeppeling onlyowner library
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

}