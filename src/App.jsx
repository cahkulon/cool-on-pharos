import { useState } from "react";
import { ethers } from "ethers";
import { FAUCET_ABI } from "./abi";

const FAUCET_ADDRESS = "0xA938FfA517CD4b9f6690e9191e3AF9C4f89f4c5c";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("");

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function claimTokens() {
    if (!walletAddress) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);

    try {
      const tx = await faucetContract.claim();
      await tx.wait();
      setStatus("✅ Claim successful!");
    } catch (err) {
      setStatus("❌ Claim failed: " + (err.reason || err.message));
    }
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold mb-4">🚰 Testnet Faucet</h1>

      {!walletAddress ? (
        <button onClick={connectWallet} className="px-4 py-2 bg-blue-600 text-white rounded">
          Connect Wallet
        </button>
      ) : (
        <>
          <p className="mb-2">Connected: {walletAddress}</p>
          <button onClick={claimTokens} className="px-4 py-2 bg-green-600 text-white rounded">
            Claim Tokens
          </button>
        </>
      )}

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}

export default App;
