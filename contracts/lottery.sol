// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.0 <0.9.0;
contract Lottery{
    address public admin;
    address payable [] public participants;
    address payable public winner;

    constructor(){
        admin = msg.sender;
    }

    function enrollment() public payable{
        require(msg.value == 1 ether,"Please pay 1 ether only");
        participants.push(payable(msg.sender)); 
    }

    function getbalance() public view returns(uint){
        require(admin == msg.sender,"You are not the admin");
        return address(this).balance;
    }

    function randomized() internal view returns(uint){
       return uint (keccak256(abi.encodePacked(block.difficulty,block.timestamp,participants.length)));
    }

    function pickwinner() public{
        require(admin==msg.sender , "You are not the manager");
        require(participants.length>=3,"Player are less than 3");

        uint r = randomized();
        uint index = r%participants.length;
        winner = participants[index];
        winner.transfer(getbalance());
        participants= new address payable [](0);
    }

 
}