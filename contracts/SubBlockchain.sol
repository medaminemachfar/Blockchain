// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IMainBlockchain {
    function receiveReport(address _subBlockchain, uint256 _totalTransactions, uint256 _totalTokensTraded) external;
}

contract SubBlockchain {
    struct User {
        string name;
        uint256 tokens;
        bool isRegistered;
        bytes32 passwordHash; // Store the hash of the user's password
    }

    mapping(address => User) public users;
    uint256 public totalTransactions; // Tracks total transactions in the sub-blockchain
    uint256 public totalTokensTraded; // Tracks total tokens traded in the sub-blockchain
    string public neighborhoodName;   // Neighborhood name for this sub-blockchain
    address public mainBlockchain;    // Address of the main blockchain

    event UserRegistered(address user, string name);
    event EnergyTraded(address user, uint256 amount, string tradeType);

    constructor(address _mainBlockchain, string memory _neighborhoodName) {
        mainBlockchain = _mainBlockchain;
        neighborhoodName = _neighborhoodName;
    }

    modifier onlyRegisteredUser(address _user) {
        require(users[_user].isRegistered, "User not registered");
        _;
    }

    function registerUser(string memory _name, bytes32 _passwordHash) public {
        require(!users[msg.sender].isRegistered, "User already registered");

        users[msg.sender] = User({
            name: _name,
            tokens: 100, // Initial token balance
            isRegistered: true,
            passwordHash: _passwordHash
        });

        emit UserRegistered(msg.sender, _name);
    }

    function buyEnergy(uint256 _amount) public onlyRegisteredUser(msg.sender) {
        require(users[msg.sender].tokens >= _amount, "Insufficient tokens");
        users[msg.sender].tokens -= _amount;
        totalTransactions++;
        totalTokensTraded += _amount;

        emit EnergyTraded(msg.sender, _amount, "Buy");
    }

    function sellEnergy(uint256 _amount) public onlyRegisteredUser(msg.sender) {
        users[msg.sender].tokens += _amount;
        totalTransactions++;
        totalTokensTraded += _amount;

        emit EnergyTraded(msg.sender, _amount, "Sell");
    }

    function reportToMainBlockchain() public {
        IMainBlockchain(mainBlockchain).receiveReport(
            address(this),
            totalTransactions,
            totalTokensTraded
        );
    }
}
