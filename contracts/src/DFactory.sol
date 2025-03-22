// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {DFund} from "./DFund.sol";

contract daoFactory {
    mapping(address => uint256) public numberOfDaos;
    mapping(address => mapping(uint256 => dao)) public userToAddress;

    struct dao {
        address dao;
        address creator;
        string campaignID;
    }

    /**
     *
     * @param _fundingGoal Amount to be raised in Rootoshi
     * @param _duration Duration of the project in blocks
     * @param _milestoneDescriptions Descriptions of the milstones to be completed
     * @param _campaignID The unique ID of the project in the database
     * @dev Launches a campaign and stores the details
     */
    function createCampaign(
        uint256 _fundingGoal,
        uint256 _duration,
        string[] memory _milestoneDescriptions,
        string memory _campaignID
    ) external returns (address) {
        DFund temp = new DFund(msg.sender, _fundingGoal, _duration, _milestoneDescriptions);

        numberOfDaos[msg.sender] += 1;
        userToAddress[msg.sender][numberOfDaos[msg.sender]] = dao(address(temp), msg.sender, _campaignID);

        return address(temp);
    }
}
