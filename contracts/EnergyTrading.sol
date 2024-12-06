// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract EnergyTrading {
    // Structure to store user details
    struct User {
        string name;
        uint256 tokens;
        bool isRegistered;
    }

    // Mapping to store users
    mapping(address => User) public users;

    // Event declarations
    event UserRegistered(address user, string name);
    event EnergyBought(address buyer, uint256 amount);
    event EnergySold(address seller, uint256 amount);

    // Function to register a user
    function registerUser(string memory _name) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User(_name, 100, true); // Default tokens set to 100
        emit UserRegistered(msg.sender, _name);
    }

    // Function to buy energy
    function buyEnergy(uint256 _amount) public {
        require(users[msg.sender].isRegistered, "User not registered");
        require(users[msg.sender].tokens >= _amount, "Insufficient tokens");

        users[msg.sender].tokens -= _amount;
        emit EnergyBought(msg.sender, _amount);
    }

    // Function to sell energy
    function sellEnergy(uint256 _amount) public {
        require(users[msg.sender].isRegistered, "User not registered");

        users[msg.sender].tokens += _amount;
        emit EnergySold(msg.sender, _amount);
    }

    // Function to get user details
    function getUserDetails(address _user) public view returns (string memory, uint256) {
        require(users[_user].isRegistered, "User not registered");
        User memory user = users[_user];
        return (user.name, user.tokens);
    }
}
