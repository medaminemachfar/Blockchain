const Contract = artifacts.require('EnergyTrading');
const { sha3 } = require('web3-utils'); // To hash the password

module.exports = async function (callback) {
    try {
        const accounts = await web3.eth.getAccounts();
        const instance = await Contract.deployed();

        console.log('Contract deployed at:', instance.address);

        const totalTransactions = 10; // Test with 10 transactions for throughput
        const start = Date.now();

        for (let i = 0; i < totalTransactions; i++) {
            const password = `password${i}`; // Example passwords
            const passwordHash = sha3(password); // Hash the password

            console.log(`Registering User${i} from account ${accounts[i % accounts.length]}`);

            await instance.registerUserWithCredentials(`User${i}`, passwordHash, {
                from: accounts[i % accounts.length],
                gas: 3000000,
            });
        }

        const end = Date.now();
        const throughput = totalTransactions / ((end - start) / 1000); // Calculate transactions per second (TPS)
        console.log(`Transaction Throughput: ${throughput.toFixed(2)} TPS`);
    } catch (error) {
        console.error('Error measuring throughput:', error);
    }

    callback();
};
