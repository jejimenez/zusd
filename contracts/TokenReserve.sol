// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract TokenReserve {
    IERC20 private _token;
    mapping(address => uint) public stakingBalance;
    uint256 public _decimals;

    /*
       USDC Rinkeby: 0xeb8f08a975Ab53E34D8a0330E0D34de942C95926
    */
    constructor(address _erc20Token) {
        _token = IERC20(_erc20Token);
        _decimals = 6;
    }

    function stakeTokens(uint _amount) public {

        // amount should be > 0
        require(_amount > 0, "amount should be > 0");

        // transfer USDC to this contract for staking
        _token.transferFrom(msg.sender, address(this), _amount);
        
        // update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
    }

    // Unstaking Tokens (Withdraw)
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];

        // balance should be > 0
        require (balance > 0, "staking balance cannot be 0");

        // Transfer Mock USDC tokens to this contract for staking
        _token.transfer(msg.sender, balance);

        // reset staking balance to 0
        stakingBalance[msg.sender] = 0;
    }

    // Unstaking Tokens 
    function unstakePartialTokens(address _to, uint _amount) internal {
        // balance should be > 0
        require (_amount > 0, "amount should be > 0");

        // Transfer Mock Dai tokens to this contract for staking
        _token.transfer(_to, _amount);

        // reset staking balance to 0
        stakingBalance[msg.sender] = stakingBalance[msg.sender] - _amount;
    }


}