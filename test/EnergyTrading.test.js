const EnergyTrading = artifacts.require("EnergyTrading");

contract("EnergyTrading", (accounts) => {
  let energyTrading;

  // Predefined accounts
  const user1 = accounts[0];
  const user2 = accounts[1];

  before(async () => {
    // Deploy the contract
    energyTrading = await EnergyTrading.deployed();
  });

  it("should register a user", async () => {
    // Register user1
    const name = "Alice";
    await energyTrading.registerUser(name, { from: user1 });

    // Fetch user details
    const userDetails = await energyTrading.getUserDetails(user1);
    assert.equal(userDetails[0], name, "Name does not match");
    assert.equal(userDetails[1].toNumber(), 100, "Initial tokens should be 100");
  });

  it("should not allow duplicate registration", async () => {
    try {
      await energyTrading.registerUser("Duplicate", { from: user1 });
      assert.fail("Duplicate registration should fail");
    } catch (err) {
      assert(err.message.includes("User already registered"), "Unexpected error message");
    }
  });

  it("should allow user to buy energy", async () => {
    // Buy 50 tokens
    await energyTrading.buyEnergy(50, { from: user1 });

    // Fetch user tokens
    const userDetails = await energyTrading.getUserDetails(user1);
    assert.equal(userDetails[1].toNumber(), 50, "Tokens should be reduced by 50");
  });

  it("should not allow buying energy with insufficient tokens", async () => {
    try {
      await energyTrading.buyEnergy(100, { from: user1 });
      assert.fail("Transaction should fail due to insufficient tokens");
    } catch (err) {
      assert(err.message.includes("Insufficient tokens"), "Unexpected error message");
    }
  });

  it("should allow user to sell energy", async () => {
    // Sell 20 tokens
    await energyTrading.sellEnergy(20, { from: user1 });

    // Fetch user tokens
    const userDetails = await energyTrading.getUserDetails(user1);
    assert.equal(userDetails[1].toNumber(), 70, "Tokens should increase by 20");
  });

  it("should allow another user to register and interact", async () => {
    // Register user2
    const name = "Bob";
    await energyTrading.registerUser(name, { from: user2 });

    // Fetch user2 details
    const userDetails = await energyTrading.getUserDetails(user2);
    assert.equal(userDetails[0], name, "Name does not match");
    assert.equal(userDetails[1].toNumber(), 100, "Initial tokens should be 100");

    // User2 buys 30 tokens
    await energyTrading.buyEnergy(30, { from: user2 });
    const updatedDetails = await energyTrading.getUserDetails(user2);
    assert.equal(updatedDetails[1].toNumber(), 70, "Tokens should reduce by 30");
  });
});
