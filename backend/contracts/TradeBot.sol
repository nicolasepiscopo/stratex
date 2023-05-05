pragma solidity =0.7.6;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SingleSwap {
    address public constant routerAddress = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    ISwapRouter public immutable swapRouter = ISwapRouter(routerAddress);

    address public constant WMATIC = 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889; // Polygon Network :
    address public constant WETH = 0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa; // Polygon Network


    //address public constant GETH  = 0xdD69DB25F6D620A7baD3023c5d32761D353D3De9 ; // Goerli ETH
    //address public constant GLINK = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB; // goerli  LINK


    IERC20 public linkToken = IERC20(WMATIC);

    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;


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

    receive() payable external {}
}
