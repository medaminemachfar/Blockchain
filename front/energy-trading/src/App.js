import React, { useEffect, useState } from "react";
import Web3 from "web3";
import MainBlockchain from "./contracts/MainBlockchain.json";
import SubBlockchain from "./contracts/SubBlockchain.json";
import { sha3 } from "web3-utils";
import "./App.css"; // External CSS file for styling

function App() {
  const [web3, setWeb3] = useState(null);
  const [mainContract, setMainContract] = useState(null);
  const [subContracts, setSubContracts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  // Registration Fields
  const [registerName, setRegisterName] = useState("");
  const [registerAddress, setRegisterAddress] = useState(""); 
  const [registerPassword, setRegisterPassword] = useState("");

  // Login Fields
  const [loginAddress, setLoginAddress] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loggedInAddress, setLoggedInAddress] = useState(null);
  const [userDetails, setUserDetails] = useState({ name: "", tokens: 0 });
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const web3Instance = new Web3("http://127.0.0.1:8545");
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedMainNetwork = MainBlockchain.networks[networkId];

        if (deployedMainNetwork) {
          const mainInstance = new web3Instance.eth.Contract(
            MainBlockchain.abi,
            deployedMainNetwork.address
          );
          setMainContract(mainInstance);

          // Fetch Sub-Blockchain Addresses
          const subAddresses = await mainInstance.methods.getAllSubBlockchainAddresses().call();

          const subInstances = await Promise.all(
            subAddresses.map(async (address) => {
              const subInstance = new web3Instance.eth.Contract(SubBlockchain.abi, address);
              const name = await subInstance.methods.neighborhoodName().call();
              return { address, name, instance: subInstance };
            })
          );
          setSubContracts(subInstances);
          setNeighborhoods(subInstances.map((sub) => sub.name));
        } else {
          setErrorMessage("Main blockchain not deployed on this network.");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setErrorMessage("Failed to initialize blockchain.");
      }
    };

    loadBlockchainData();
  }, []);

  const handleRegister = async () => {
    if (!registerName || !registerAddress || !registerPassword || !selectedNeighborhood) {
      setErrorMessage("All fields, including address and neighborhood, are required for registration.");
      return;
    }

    const neighborhoodContract = subContracts.find((sub) => sub.name === selectedNeighborhood);
    if (!neighborhoodContract) {
      setErrorMessage("Selected neighborhood not found.");
      return;
    }

    try {
      const passwordHash = sha3(registerPassword);

      // Register user in the SubBlockchain
      await neighborhoodContract.instance.methods
        .registerUser(registerName, passwordHash)
        .send({ from: registerAddress, gas: 3000000 });

      setErrorMessage("Registered successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Registration failed. Check console for details.");
    }
  };

  const handleLogin = async () => {
    if (!loginAddress || !loginPassword || !selectedNeighborhood) {
      setErrorMessage("All fields, including neighborhood selection, are required for login.");
      return;
    }

    const neighborhoodContract = subContracts.find((sub) => sub.name === selectedNeighborhood);
    if (!neighborhoodContract) {
      setErrorMessage("Selected neighborhood not found.");
      return;
    }

    try {
      const userData = await neighborhoodContract.instance.methods.users(loginAddress).call();
      if (!userData.isRegistered) {
        setErrorMessage("User not registered in this neighborhood.");
        return;
      }

      const enteredPasswordHash = sha3(loginPassword);
      if (userData.passwordHash === enteredPasswordHash) {
        setLoggedInAddress(loginAddress);
        setUserDetails({ name: userData.name, tokens: parseInt(userData.tokens, 10) });
        setErrorMessage("");
      } else {
        setErrorMessage("Invalid credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Login failed.");
    }
  };

  const handleBuyEnergy = async () => {
    if (!buyAmount || buyAmount <= 0) {
      setErrorMessage("Enter a valid amount to buy energy.");
      return;
    }

    const neighborhoodContract = subContracts.find((sub) => sub.name === selectedNeighborhood);
    if (!neighborhoodContract) {
      setErrorMessage("Selected neighborhood not found.");
      return;
    }

    try {
      await neighborhoodContract.instance.methods
        .buyEnergy(parseInt(buyAmount))
        .send({ from: loggedInAddress, gas: 3000000 });

      setErrorMessage("Energy bought successfully!");
      await handleLogin(); // Refresh user data
    } catch (error) {
      console.error("Error buying energy:", error);
      setErrorMessage("Error buying energy.");
    }
  };

  const handleSellEnergy = async () => {
    if (!sellAmount || sellAmount <= 0) {
      setErrorMessage("Enter a valid amount to sell energy.");
      return;
    }

    const neighborhoodContract = subContracts.find((sub) => sub.name === selectedNeighborhood);
    if (!neighborhoodContract) {
      setErrorMessage("Selected neighborhood not found.");
      return;
    }

    try {
      await neighborhoodContract.instance.methods
        .sellEnergy(parseInt(sellAmount))
        .send({ from: loggedInAddress, gas: 3000000 });

      setErrorMessage("Energy sold successfully!");
      await handleLogin(); // Refresh user data
    } catch (error) {
      console.error("Error selling energy:", error);
      setErrorMessage("Error selling energy.");
    }
  };


  return (
    <div className="app-container">
      <h1 className="app-title">Smart City Energy Trading Platform</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!loggedInAddress && (
        <div className="card">
          <h3>Register</h3>
          <input
            type="text"
            placeholder="Name"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Address"
            value={registerAddress}
            onChange={(e) => setRegisterAddress(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <select
            value={selectedNeighborhood || ""}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
          >
            <option value="" disabled>Select a neighborhood</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
          <button className="btn" onClick={handleRegister}>
            Register
          </button>
  
          <h3>Login</h3>
          <input
            type="text"
            placeholder="Address"
            value={loginAddress}
            onChange={(e) => setLoginAddress(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <select
            value={selectedNeighborhood || ""}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
          >
            <option value="" disabled>Select a neighborhood</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood} value={neighborhood}>
                {neighborhood}
              </option>
            ))}
          </select>
          <button className="btn" onClick={handleLogin}>
            Login
          </button>
        </div>
      )}
      {loggedInAddress && (
        <div className="card">
          <h2>Welcome, {userDetails.name}</h2>
          <p>Tokens: {userDetails.tokens}</p>
  
          <div>
            <h3>Buy Energy</h3>
            <input
              type="number"
              placeholder="Amount to Buy"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
            />
            <button className="btn" onClick={handleBuyEnergy}>
              Buy Energy
            </button>
          </div>
  
          <div>
            <h3>Sell Energy</h3>
            <input
              type="number"
              placeholder="Amount to Sell"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
            />
            <button className="btn" onClick={handleSellEnergy}>
              Sell Energy
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
}

export default App;
