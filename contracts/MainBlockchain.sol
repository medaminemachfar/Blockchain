// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract MainBlockchain {
    struct SubBlockchainData {
        uint256 totalTransactions;
        uint256 totalTokensTraded;
    }

    mapping(address => string) public subBlockchainNeighborhoods; // Maps sub-blockchain addresses to neighborhood names
    mapping(address => SubBlockchainData) public subBlockchains;   // Data for each sub-blockchain
    mapping(address => string) public userNeighborhoods;           // Maps user addresses to their neighborhood
    address[] public subBlockchainAddresses;                      // List of all sub-blockchains

    event SubBlockchainRegistered(address indexed subBlockchain, string neighborhoodName);
    event UserAssigned(address indexed user, string neighborhood);
    event SubBlockchainReported(address indexed subBlockchain, uint256 totalTransactions, uint256 totalTokensTraded);

    function registerSubBlockchain(address _subBlockchain, string memory _neighborhoodName) public {
        subBlockchainNeighborhoods[_subBlockchain] = _neighborhoodName;
        subBlockchainAddresses.push(_subBlockchain);

        emit SubBlockchainRegistered(_subBlockchain, _neighborhoodName);
    }

    function assignUserToNeighborhood(address _user, string memory _neighborhood) public {
        userNeighborhoods[_user] = _neighborhood;
        emit UserAssigned(_user, _neighborhood);
    }

    function receiveReport(address _subBlockchain, uint256 _totalTransactions, uint256 _totalTokensTraded) public {
        require(isRegisteredSubBlockchain(_subBlockchain), "Sub-blockchain not registered");

        subBlockchains[_subBlockchain].totalTransactions += _totalTransactions;
        subBlockchains[_subBlockchain].totalTokensTraded += _totalTokensTraded;

        emit SubBlockchainReported(_subBlockchain, _totalTransactions, _totalTokensTraded);
    }

    function isRegisteredSubBlockchain(address _subBlockchain) public view returns (bool) {
        for (uint256 i = 0; i < subBlockchainAddresses.length; i++) {
            if (subBlockchainAddresses[i] == _subBlockchain) {
                return true;
            }
        }
        return false;
    }

    function getSubBlockchainData(address _subBlockchain) public view returns (uint256, uint256) {
        SubBlockchainData memory data = subBlockchains[_subBlockchain];
        return (data.totalTransactions, data.totalTokensTraded);
    }
    function getAllSubBlockchainAddresses() public view returns (address[] memory) {
    return subBlockchainAddresses;
}
}
