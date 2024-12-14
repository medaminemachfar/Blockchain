const Contract = artifacts.require('EnergyTrading'); // Reference your smart contract
const { sha3 } = require('web3-utils'); // Import hashing utility

module.exports = async function (callback) {
    try {
        const accounts = await web3.eth.getAccounts(); // Fetch accounts
        const instance = await Contract.deployed(); // Get deployed contract instance

        console.log('Contract deployed at:', instance.address);

        const passwordHash = sha3('energyTestPassword');
        console.log('Registering a user to measure gas usage...');

        // Register a new user
        const receipt = await instance.registerUserWithCredentials('EnergyTestUser', passwordHash, {
            from: accounts[0], // Use the first account
            gas: 3000000, // Provide enough gas
        });

        // Log the gas used in the transaction
        console.log(`Gas Used for Registration: ${receipt.receipt.gasUsed}`);

        // Estimate energy consumed
        const energyPerGasUnit = 0.0000001; // Example value in kWh (replace with real-world estimate if available)
        const totalEnergy = receipt.receipt.gasUsed * energyPerGasUnit;
        console.log(`Estimated Energy Consumed: ${totalEnergy} kWh`);
    } catch (error) {
        console.error('Error measuring energy efficiency:', error.message || error.reason);
    }

    callback();
};
