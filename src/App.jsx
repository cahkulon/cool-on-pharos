import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { FAUCET_ABI } from "./abi";

const FAUCET_ADDRESS = "0xA938FfA517CD4b9f6690e9191e3AF9C4f89f4c5c";
const PHAROS_CHAIN_ID = "0xA8230"; // 688688 decimal dalam hex

export default function App() {
  const [address, setAddress] = useState(null);
  const [status, setStatus] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask or other injected wallet!");
      return;
    }

    try {
      // Coba switch ke Pharos Testnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: PHAROS_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Jaringan belum ada, tambah jaringan baru
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: PHAROS_CHAIN_ID,
                chainName: "Pharos Testnet",
                nativeCurrency: {
                  name: "PHRS",
                  symbol: "PHRS",
                  decimals: 18,
                },
                rpcUrls: ["https://testnet.dplabs-internal.com"],
                blockExplorerUrls: ["https://testnet.pharosscan.xyz"],
              },
            ],
          });
        } catch (addError) {
          alert("Gagal menambahkan jaringan Pharos Testnet");
          return;
        }
      } else {
        alert("Gagal switch jaringan");
        return;
      }
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      window.signer = signer;
      setStatus("Wallet connected on Pharos Testnet");
    } catch (e) {
      setStatus("Connection rejected");
    }
  }

  async function claim() {
    if (!window.signer) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const contract = new Contract(FAUCET_ADDRESS, FAUCET_ABI, window.signer);
      const tx = await contract.claim();
      setStatus("Waiting for confirmation...");
      await tx.wait();
      setStatus("Claim successful!");
    } catch (e) {
      setStatus("Claim failed: " + (e.reason || e.message));
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>🚰 Faucet Claim</h1>
      {!address ? (
        <button onClick={connectWallet} style={{ padding: "10px 20px" }}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>Connected: {address}</p>
          <button onClick={claim} style={{ padding: "10px 20px" }}>
            Claim Tokens
          </button>
        </>
      )}
      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  );
}
