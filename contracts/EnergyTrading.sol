// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract EnergyTrading {
    struct User {
        string name;
        uint256 tokens;
        bool isRegistered;
        bytes32 passwordHash; // Store the hash of the user's password
    }

    mapping(address => User) public users;

    event UserRegistered(address user, string name);

    function registerUserWithCredentials(string memory _name, bytes32 _passwordHash) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User({
            name: _name,
            tokens: 100,
            isRegistered: true,
            passwordHash: _passwordHash
        });
        emit UserRegistered(msg.sender, _name);
    }

    // Since we now rely on password verification, we remove the require statement from getUserDetails
    // or we leave it, but remember we must first verify on the frontend before calling restricted functions.
    function getUserDetails(address _user) public view returns (string memory, uint256) {
        require(users[_user].isRegistered, "User not registered");
        return (users[_user].name, users[_user].tokens);
    }

    // Buy and sell functions remain the same, but you will only call them after verifying user credentials off-chain.
    function buyEnergy(uint256 _amount) public {
        require(users[msg.sender].isRegistered, "User not registered");
        require(users[msg.sender].tokens >= _amount, "Insufficient tokens");

        users[msg.sender].tokens -= _amount;
    }

    function sellEnergy(uint256 _amount) public {
        require(users[msg.sender].isRegistered, "User not registered");
        users[msg.sender].tokens += _amount;
    }
}

