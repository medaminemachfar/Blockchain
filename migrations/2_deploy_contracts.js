const EnergyTrading = artifacts.require("EnergyTrading");

module.exports = function (deployer) {
  deployer.deploy(EnergyTrading, { gas: 3000000 });
};
