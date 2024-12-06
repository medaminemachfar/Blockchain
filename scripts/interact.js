const EnergyTrading = artifacts.require("EnergyTrading");

module.exports = async function (callback) {
    try {
        let instance = await EnergyTrading.deployed();

        console.log("Registering user...");
        await instance.registerUser("Bob");

        console.log("Getting user details...");
        let userDetails = await instance.getUserDetails(web3.eth.accounts[0]);
        console.log("User details: ", userDetails);

        callback();
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
