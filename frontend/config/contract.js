import { ethers } from "ethers";
import ABI from '../abi/MaidFinder.json';

const CONTRACT_ADDRESS = "0xfe34aBAc056AE81d0a33Ede4A3E9AF5DC8e338C1";

// ✅ Get contract instance
const getContract = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return { contract: null, signer: null };
  }

  try {
    // Request accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      alert("No wallet connected!");
      return { contract: null, signer: null };
    }

    // Provider & Signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Optional: listen for account changes
    window.ethereum.on("accountsChanged", (newAccounts) => {
      console.log("Accounts changed:", newAccounts);
      window.location.reload(); // reload page to refresh wallet
    });

    // Optional: listen for network changes
    window.ethereum.on("chainChanged", () => {
      console.log("Network changed");
      window.location.reload();
    });

    // Contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);

    return { contract, signer };
  } catch (err) {
    console.error("Error getting contract:", err.message);
    return { contract: null, signer: null };
  }
};

export default getContract;
