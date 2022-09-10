// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./IPriceConsumerV3.sol";
import "./PriceConsumerV3.sol";

contract ERC20 is IERC20, PriceConsumerV3{
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name = "Zulu USD";
    string public symbol = "ZUSD";
    uint8 public decimals = 18;

    uint256 public lastTimeStamp;

    int256 ETHprice;


    constructor(address _priceOracle){
        //priceConsumer = PriceConsumerV3(_priceOracle);
        priceFeed = AggregatorV3Interface(_priceOracle);
        lastTimeStamp = block.timestamp;
    }

    function transfer(address recipient, uint amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function updatePrice() public returns(int256){
        ETHprice = getLatestPrice();
        lastTimeStamp = block.timestamp;
        return ETHprice;
    }

    function getPrice() public view returns(int256){
        return ETHprice;
    }
}