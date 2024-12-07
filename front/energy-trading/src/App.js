import React, { useEffect, useState } from "react";
import Web3 from "web3";
import EnergyTrading from "./contracts/EnergyTrading.json";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [userDetails, setUserDetails] = useState({ name: "", tokens: 0 });
  const [newName, setNewName] = useState("");
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);

  useEffect(() => {
    const loadWeb3AndBlockchainData = async () => {
      try {
        console.log("Initializing Web3...");
        const web3Instance = new Web3("http://127.0.0.1:8545");
        setWeb3(web3Instance);

        const accs = await web3Instance.eth.getAccounts();
        console.log("Accounts fetched:", accs);
        setAccounts(accs);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = EnergyTrading.networks[networkId];

        if (deployedNetwork) {
          console.log("Deployed contract found at:", deployedNetwork.address);
          const contractInstance = new web3Instance.eth.Contract(
            EnergyTrading.abi,
            deployedNetwork.address
          );
          setContract(contractInstance);
        } else {
          console.error("No deployed contract found on this network!");
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    loadWeb3AndBlockchainData();
  }, []);

  const getUserDetails = async (address, contractInstance = contract) => {
    try {
      if (!contractInstance) {
        console.error("Contract not initialized.");
        return;
      }
      console.log("Fetching details for:", address);
      const details = await contractInstance.methods.getUserDetails(address).call();
      console.log("User Details fetched:", details);
      setUserDetails({ name: details[0], tokens: details[1] });
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleRegister = async () => {
    try {
      if (!newName.trim()) {
        console.error("Please enter a valid name before registering.");
        return;
      }

      if (contract && accounts[0]) {
        console.log("Registering user with name:", newName, "from account:", accounts[0]);
        await contract.methods.registerUser(newName)
          .send({ from: accounts[0], gas: 3000000 });
        console.log("User registered successfully with name:", newName);
        await getUserDetails(accounts[0]);
      } else {
        console.error("Contract or accounts not loaded correctly.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  const handleBuyEnergy = async () => {
    try {
      if (contract && accounts[0]) {
        const amountToBuy = parseInt(buyAmount, 10);
        console.log("Buying energy:", amountToBuy, "tokens from:", accounts[0]);
        await contract.methods.buyEnergy(amountToBuy)
          .send({ from: accounts[0], gas: 3000000 });
        console.log("Energy bought successfully.");
        await getUserDetails(accounts[0]);
      } else {
        console.error("Contract or accounts not loaded correctly for buying.");
      }
    } catch (error) {
      console.error("Error buying energy:", error);
    }
  };

  const handleSellEnergy = async () => {
    try {
      if (contract && accounts[0]) {
        const amountToSell = parseInt(sellAmount, 10);
        console.log("Selling energy:", amountToSell, "tokens from:", accounts[0]);
        await contract.methods.sellEnergy(amountToSell)
          .send({ from: accounts[0], gas: 3000000 });
        console.log("Energy sold successfully.");
        await getUserDetails(accounts[0]);
      } else {
        console.error("Contract or accounts not loaded correctly for selling.");
      }
    } catch (error) {
      console.error("Error selling energy:", error);
    }
  };

  return (
    <div>
      <h1>Energy Trading</h1>
      <h2>Account: {accounts.length > 0 ? accounts[0] : "No account loaded"}</h2>
      <h3>User Details</h3>
      <p>Name: {userDetails.name}</p>
      <p>Tokens: {userDetails.tokens}</p>

      <div>
        <h3>Register</h3>
        <input
          type="text"
          placeholder="Enter your name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
      </div>

      <div>
        <h3>Buy Energy</h3>
        <input
          type="number"
          placeholder="Enter amount to buy"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
        />
        <button onClick={handleBuyEnergy}>Buy Energy</button>
      </div>

      <div>
        <h3>Sell Energy</h3>
        <input
          type="number"
          placeholder="Enter amount to sell"
          value={sellAmount}
          onChange={(e) => setSellAmount(e.target.value)}
        />
        <button onClick={handleSellEnergy}>Sell Energy</button>
      </div>
    </div>
  );
}

export default App;
