import React, { useEffect, useState } from "react";
import Web3 from "web3";
import EnergyTrading from "./contracts/EnergyTrading.json";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [userDetails, setUserDetails] = useState({ name: "", tokens: 0 });
  const [newName, setNewName] = useState("");
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    async function loadWeb3() {
      // Initialize Web3 using Ganache's RPC endpoint (use your own if different)
      const web3Instance = new Web3("http://127.0.0.1:8545");
      setWeb3(web3Instance);
    }

    async function loadBlockchainData() {
      if (web3) {
        const web3Instance = web3;

        // Get the first account from Ganache
        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = EnergyTrading.networks[networkId];
        let contractAddress;
        
        if (deployedNetwork) {
          contractAddress = deployedNetwork.address;
        } else {
          contractAddress = "0x723E6fFAb338346afe3E51127b8Be8Df27159aB3"; // Fallback address
        }

        const contractInstance = new web3Instance.eth.Contract(
          EnergyTrading.abi,
          contractAddress
        );
        setContract(contractInstance);

        // Fetch user details if already registered
        if (accounts[0]) {
          getUserDetails(accounts[0]);
        }
      }
    }

    loadWeb3();
    loadBlockchainData();
  }, [web3]);

  const handleRegister = async () => {
    if (contract && accounts[0]) {
      await contract.methods.registerUser(newName).send({ from: accounts[0] });
      getUserDetails(accounts[0]);
    }
  };

  const getUserDetails = async (address) => {
    try {
      if (contract) {
        const details = await contract.methods.getUserDetails(address).call();
        setUserDetails({ name: details[0], tokens: details[1] });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleBuyEnergy = async () => {
    if (contract && accounts[0]) {
      await contract.methods.buyEnergy(amount).send({ from: accounts[0] });
      getUserDetails(accounts[0]);
    }
  };

  const handleSellEnergy = async () => {
    if (contract && accounts[0]) {
      await contract.methods.sellEnergy(amount).send({ from: accounts[0] });
      getUserDetails(accounts[0]);
    }
  };

  return (
    <div>
      <h1>Energy Trading</h1>
      <h2>Account: {accounts[0]}</h2>
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
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleBuyEnergy}>Buy Energy</button>
      </div>

      <div>
        <h3>Sell Energy</h3>
        <input
          type="number"
          placeholder="Enter amount to sell"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleSellEnergy}>Sell Energy</button>
      </div>
    </div>
  );
}

export default App;
