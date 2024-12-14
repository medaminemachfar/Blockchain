const Contract = artifacts.require('EnergyTrading'); // Reference your contract
const { sha3 } = require('web3-utils'); // Hashing utility

module.exports = async function (callback) {
    try {
        const accounts = await web3.eth.getAccounts(); // Fetch all Ganache accounts
        const instance = await Contract.deployed(); // Get the deployed contract instance

        console.log('Contract deployed at:', instance.address);

        const numParticipants = 10; // Number of participants
        const transactionsPerParticipant = 5; // Transactions each participant performs

        console.log('Registering participants...');
        // Register all participants
        for (let i = 0; i < numParticipants; i++) {
            const passwordHash = sha3(`password${i}`);
            try {
                await instance.registerUserWithCredentials(`User${i}`, passwordHash, {
                    from: accounts[i % accounts.length],
                    gas: 3000000,
                });
                console.log(`Registered User${i} from account ${accounts[i % accounts.length]}`);
            } catch (error) {
                console.error(`Failed to register User${i}: ${error.reason || error.message}`);
            }
        }

        console.log('Starting energy trading transactions...');
        const start = Date.now();

        // Perform buy and sell transactions
        for (let i = 0; i < numParticipants; i++) {
            for (let j = 0; j < transactionsPerParticipant; j++) {
                const amount = 10; // Energy units
                const buyer = accounts[i % accounts.length];
                const seller = accounts[(i + 1) % accounts.length];

                try {
                    // Buyer buys energy
                    await instance.buyEnergy(amount, {
                        from: buyer,
                        gas: 3000000,
                    });

                    // Seller sells energy
                    await instance.sellEnergy(amount, {
                        from: seller,
                        gas: 3000000,
                    });
                } catch (error) {
                    console.error(`Transaction failed for User${i}: ${error.reason || error.message}`);
                }
            }
        }

        const end = Date.now();
        console.log(`Total Transactions: ${numParticipants * transactionsPerParticipant * 2}`);
        console.log(`Total Time: ${(end - start) / 1000} seconds`);
    } catch (error) {
        console.error('Error measuring scalability:', error.reason || error.message);
    }

    callback();
};
