import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { FAUCET_ABI } from "./abi";

const FAUCET_ADDRESS = "0xA938FfA517CD4b9f6690e9191e3AF9C4f89f4c5c";

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState("");

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      window.signer = signer; // simpan signer untuk pemakaian selanjutnya
    } else {
      alert("Please install MetaMask");
    }
  }

  async function claimTokens() {
    if (!window.signer) return;

    try {
      const contract = new Contract(FAUCET_ADDRESS, FAUCET_ABI, window.signer);
      const tx = await contract.claim();
      await tx.wait();
      setStatus("✅ Claim successful!");
    } catch (err) {
      setStatus(`❌ Claim failed: ${err.reason || err.message}`);
    }
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-xl font-bold mb-4">🚰 Testnet Faucet</h1>
      {!walletAddress ? (
        <button onClick={connectWallet} className="bg-blue-600 text-white px-4 py-2 rounded">
          Connect Wallet
        </button>
      ) : (
        <>
          <p className="mb-2">Connected: {walletAddress}</p>
          <button onClick={claimTokens} className="bg-green-600 text-white px-4 py-2 rounded">
            Claim Tokens
          </button>
        </>
      )}
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
