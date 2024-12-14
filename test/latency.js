// Latency Test
const Contract = artifacts.require('EnergyTrading');
const { sha3 } = require('web3-utils');

module.exports = async function (callback) {
    try {
        const accounts = await web3.eth.getAccounts();
        const instance = await Contract.deployed();

        console.log('Contract deployed at:', instance.address);

        const passwordHash = sha3('password');
        const start = Date.now();

        // Single registration to measure latency
        await instance.registerUserWithCredentials('LatencyTestUser', passwordHash, {
            from: accounts[0],
            gas: 3000000,
        });

        const end = Date.now();
        console.log(`Transaction Latency: ${end - start} ms`);
    } catch (error) {
        console.error('Error measuring latency:', error);
    }

    callback();
};