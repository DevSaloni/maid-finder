import React, { useState, useEffect } from "react";
import { FaLink } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import getContract from "../../config/contract";
import Sidebar from "../component/Sidebar";
import Swal from "sweetalert2";
import "./MaidManagement.css";
import "../component/Sidebar.css";
import {useApi} from "../context/ApiContext";

const MaidManagement = () => {
  const {BASE_URL} = useApi();

  const [maids, setMaids] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [wallet, setWallet] = useState(null);
  const [adminWallet, setAdminWallet] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  // 1️⃣ Connect wallet
  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setWallet(accounts[0]);
        } else {
          Swal.fire({
            icon: "warning",
            title: "MetaMask Missing",
            text: "Please install MetaMask to continue!",
        confirmButtonColor: "#e63946",   
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Connection Error",
          text: "Failed to connect MetaMask wallet!",
        confirmButtonColor: "#e63946",   
        });
      }
    };

    connectWallet();

    // Wallet change listener
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet(null);
        }
      });
    }
  }, []);

  // 2️⃣ Get Admin Address from Contract
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { contract } = await getContract();
        const adminAddress = await contract.admin(); 
        setAdminWallet(adminAddress.toLowerCase());
      } catch (err) {
        console.error("Error fetching admin from contract:", err);
        Swal.fire({
          icon: "error",
          title: "Contract Error",
          text: "Unable to fetch admin wallet from smart contract.",
        confirmButtonColor: "#e63946",   
        });
      }
    };
    fetchAdmin();
  }, []);

  // 3️⃣ Compare connected wallet and contract admin
  useEffect(() => {
    if (wallet && adminWallet) {
      if (wallet.toLowerCase() === adminWallet) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
  }, [wallet, adminWallet]);

  // 4️⃣ Fetch all maids from backend
  useEffect(() => {
    const fetchMaids = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/maids/all`);
        setMaids(res.data);
      } catch (err) {
        console.error("Error fetching maids:", err);
         Swal.fire({
          icon: "error",
          title: "Fetch Error",
          text: "Failed to load maid list from backend!",
        confirmButtonColor: "#e63946",   
        });
      }
    };
    fetchMaids();
  }, []);

  // 5️⃣ Verify maid (only admin can)
  const handleVerify = async (maidWallet) => {
  if (!isAdmin) {
     Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "🚫 You are not authorized to verify maids!",
        confirmButtonColor: "#e63946",   
      });
    return;
  }

  try {
    const { contract } = await getContract();

    console.log("Verifying maid:", maidWallet);
    const tx = await contract.verifyMaid(maidWallet, true); // send tx
     Swal.fire({
        icon: "info",
        title: "Processing...",
        text: "Transaction is being sent. Please wait!",
        showConfirmButton: false,
        allowOutsideClick: false,
        timerProgressBar: true,
      });
    
    const receipt = await tx.wait(); // wait until mined
    console.log("Transaction mined:", receipt);

    if (receipt.status === 1) {
      await axios.post(`${BASE_URL}/api/maids/updateStatus`, {
        wallet: maidWallet,
        isVerified: "Verified",
        txHash: tx.hash,
      });

      Swal.fire({
          icon: "success",
          title: "Maid Verified",
          text: "✅ Maid has been verified successfully!",
        confirmButtonColor: "#e63946",   
        });

      setMaids((prev) =>
        prev.map((m) =>
          m.wallet === maidWallet
            ? { ...m, isVerified: "Verified", txHash: tx.hash }
            : m
        )
      );
    } else {
      Swal.fire({
          icon: "error",
          title: "Transaction Failed",
          text: "⚠️ The transaction was not successful. Please try again.",
        confirmButtonColor: "#e63946",   
        });
    }
  } catch (err) {
    console.error("Verification error:", err);
     Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: "⚠️ Error verifying maid. Check MetaMask or console logs.",
        confirmButtonColor: "#e63946",   
      });
  }
};

  // 6️⃣ Reject maid (only admin can)
  const handleReject = async (maidWallet) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "🚫 You are not authorized to reject maids!",
        confirmButtonColor: "#e63946",   
      });     
       return;
    }

    try {
      await axios.post(`${BASE_URL}/api/maids/updateStatus`, {
        wallet: maidWallet,
        isVerified: "Rejected",
      });
      Swal.fire({
        icon: "warning",
        title: "Maid Rejected",
        text: "❌ Maid has been rejected successfully!",
        confirmButtonColor: "#e63946",   
      });

      setMaids((prev) =>
        prev.map((m) =>
          m.wallet === maidWallet ? { ...m, isVerified: "Rejected" } : m
        )
      );
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Reject Failed",
        text: "⚠️ Error rejecting maid. Please try again.",
        confirmButtonColor: "#e63946",   
      });
    }
  };

  // 7️⃣ Filter logic
  const filteredMaids = maids.filter((maid) => {
    if (filter !== "All" && maid.isVerified?.toLowerCase() !== filter.toLowerCase())
      return false;
    if (searchTerm.trim() !== "") {
      const s = searchTerm.toLowerCase();
      return (
        maid.fullName?.toLowerCase().includes(s) ||
        maid.wallet?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <Sidebar
        wallet={wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Not Connected"}
        role={isAdmin ? "Admin" : "User"}
      />

      <div className="dashboard">
        <h2>Maid Management</h2>

        {/* {!isAdmin && (
          <p style={{ color: "red", textAlign: "center" }}>
            ⚠️ Only the admin wallet can verify or reject maids!
          </p>
        )} */}

        <div className="maid-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Wallet or Name"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Verified</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="maid-infos">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Wallet</th>
                <th>Name</th>
                <th>Profile</th>
                <th>Status</th>
                <th>TxHash</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaids.length > 0 ? (
                filteredMaids.map((maid, index) => (
                  <tr key={maid.wallet}>
                    <td>{index + 1}</td>
                    <td>{maid.wallet}</td>
                    <td>{maid.fullName}</td>
                    <td
                      className="profile-link"
                      onClick={() => navigate(`/view-profile/${maid.wallet}`)}
                    >
                      <FaLink /> View Profile
                    </td>
                    <td>
                      <span className={`status ${maid.isVerified?.toLowerCase()}`}>
                        {maid.isVerified}
                      </span>
                    </td>
                    <td>
                      {maid.txHash ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${maid.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Tx
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="action-buttons">
                      <button
                        className="verify-btn"
                        onClick={() => handleVerify(maid.wallet)}
                        // disabled={!isAdmin}
                      >
                        Verify
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(maid.wallet)}
                        // disabled={!isAdmin}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", color: "gray", fontStyle: "italic" }}
                  >
                    No maids found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaidManagement;
