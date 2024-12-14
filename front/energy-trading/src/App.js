import React, { useEffect, useState } from "react";
import Web3 from "web3";
import EnergyTrading from "./contracts/EnergyTrading.json";
import { sha3 } from "web3-utils";
import "./App.css"; // Link to the external CSS file for improved styling

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [userDetails, setUserDetails] = useState({ name: "", tokens: 0 });
  const [registerAddress, setRegisterAddress] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginAddress, setLoginAddress] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggedInAddress, setLoggedInAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);

  useEffect(() => {
    const loadWeb3AndBlockchainData = async () => {
      try {
        const web3Instance = new Web3("http://127.0.0.1:8545");
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = EnergyTrading.networks[networkId];

        if (deployedNetwork) {
          const contractInstance = new web3Instance.eth.Contract(
            EnergyTrading.abi,
            deployedNetwork.address
          );
          setContract(contractInstance);
        } else {
          setErrorMessage("No deployed contract found on this network!");
        }
      } catch (error) {
        setErrorMessage("Initialization error. Check console.");
      }
    };

    loadWeb3AndBlockchainData();
  }, []);

  const getUserDetails = async (address) => {
    if (!contract) return;
    try {
      const details = await contract.methods.getUserDetails(address).call();
      console.log("Fetched User Details:", details); // Debug log to verify the returned values
      setUserDetails({ name: details[0], tokens: parseInt(details[1]) }); // Ensure tokens are parsed as integers
    } catch (error) {
      console.error("Error fetching user details:", error);
      setErrorMessage("Could not fetch user details.");
    }
  };
  

  const handleRegister = async () => {
    if (!registerAddress || !regName || !regPassword) {
      setErrorMessage("All fields are required for registration.");
      return;
    }
    try {
      const passwordHash = sha3(regPassword);
      await contract.methods
        .registerUserWithCredentials(regName, passwordHash)
        .send({ from: registerAddress, gas: 3000000 });
      setErrorMessage("Registered successfully!");
    } catch {
      setErrorMessage("Registration failed.");
    }
  };

  const handleLogin = async () => {
    if (!loginAddress || !loginPassword) {
      setErrorMessage("All fields are required for login.");
      return;
    }
    try {
      await getUserDetails(loginAddress);
      const userDataOnChain = await contract.methods.users(loginAddress).call();
      const enteredPasswordHash = sha3(loginPassword);
      if (userDataOnChain.passwordHash === enteredPasswordHash) {
        setLoggedInAddress(loginAddress);
        await getUserDetails(loginAddress);
        setErrorMessage("");
      } else {
        setErrorMessage("Invalid credentials.");
      }
    } catch {
      setErrorMessage("Login failed.");
    }
  };

  const handleBuyEnergy = async () => {
    try {
      const amountToBuy = parseInt(buyAmount, 10);
      await contract.methods.buyEnergy(amountToBuy).send({
        from: loggedInAddress,
        gas: 3000000,
      });
      await getUserDetails(loggedInAddress);
    } catch {
      setErrorMessage("Error buying energy.");
    }
  };

  const handleSellEnergy = async () => {
    try {
      const amountToSell = parseInt(sellAmount, 10);
      await contract.methods.sellEnergy(amountToSell).send({
        from: loggedInAddress,
        gas: 3000000,
      });
      await getUserDetails(loggedInAddress);
    } catch {
      setErrorMessage("Error selling energy.");
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Energy Trading Platform</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!loggedInAddress && (
        <div className="card">
          <h3>Register</h3>
          <input
            type="text"
            placeholder="Address"
            value={registerAddress}
            onChange={(e) => setRegisterAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Name"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
          />
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
              placeholder="Amount"
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
              placeholder="Amount"
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
