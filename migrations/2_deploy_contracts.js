const MainBlockchain = artifacts.require("MainBlockchain");
const SubBlockchain = artifacts.require("SubBlockchain");

module.exports = async function (deployer) {
  // Deploy MainBlockchain
  await deployer.deploy(MainBlockchain);
  const mainInstance = await MainBlockchain.deployed();

  // Neighborhoods
  const neighborhoods = ["Downtown", "Uptown", "Midtown"];

  // Deploy and register SubBlockchains
  for (const neighborhood of neighborhoods) {
    const subInstance = await deployer.deploy(SubBlockchain, mainInstance.address, neighborhood);
    await mainInstance.registerSubBlockchain(subInstance.address, neighborhood);
    console.log(`SubBlockchain for ${neighborhood} deployed at: ${subInstance.address}`);
  }
};
