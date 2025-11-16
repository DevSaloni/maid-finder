import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import getContract from "../../config/contract";
import Sidebar from "../component/Sidebar";
import Swal from "sweetalert2";
import "../component/Sidebar.css";
import "./JobManagement.css";
import {useApi} from "../context/ApiContext";


const JobManagement = () => {
  const {BASE_URL} = useApi();

  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [wallet, setWallet] = useState(null); // ✅ wallet state
  const [adminWallet, setAdminWallet] = useState(null); 
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  // ✅ Connect wallet like AdminDashboard
  useEffect(() => {
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          localStorage.setItem("adminWallet", accounts[0]);
        } else {
          // Only request if not already connected
          const reqAccounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setWallet(reqAccounts[0]);
          localStorage.setItem("adminWallet", reqAccounts[0]);
        }

        // Listen for wallet changes
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            localStorage.setItem("adminWallet", accounts[0]);
          } else {
            setWallet(null);
            localStorage.removeItem("adminWallet");
          }
        });
      } else {
        Swal.fire({
            icon: "warning",
            title: "MetaMask Required",
            text: "Please install MetaMask to continue!",
          });
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  connectWallet();
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
    
  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/jobs/all`);
        setJobs(res.data);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed to Fetch Jobs",
          text: "Could not load job data. Please try again later.",
        confirmButtonColor: "#e63946",   
        });
      }

    };
    fetchJobs();
  }, []);

  // Update job status
  const updateJobStatus = async (jobId, newStatus) => {
    try {
      await axios.post(`${BASE_URL}/api/jobs/updateStatus`, { jobId, status: newStatus });
      setJobs((prev) => prev.map((job) => (job.jobId === jobId ? { ...job, status: newStatus } : job)));
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel job
  const cancelJob = async (jobId) => {
    if (!isAdmin) {
       return Swal.fire({
        icon: "warning",
        title: "Access Denied 🚫",
        text: "You are not authorized to cancel jobs!",
        confirmButtonColor: "#e63946",   
      });
    }
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to cancel this job. This action cannot be undone.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it",
        confirmButtonColor: "green",   
        cancelButtonColor: "#e63946",
      });

      if (!result.isConfirmed) return;

      const { contract, signer } = await getContract();
      if (!contract || !signer) {
        return Swal.fire({
          icon: "error",
          title: "Contract Not Found",
          text: "Smart contract not initialized properly!",
        confirmButtonColor: "#e63946",   
        });
      }

      // Blockchain transaction
      const tx = await contract.connect(signer).cancelJob(jobId);
      await tx.wait();

      // Update backend
      await axios.put(`${BASE_URL}/api/jobs/cancel/${jobId}`);

      Swal.fire({
        icon: "success",
        title: "Job Cancelled ❌",
        text: "The job has been successfully cancelled on blockchain.",
        confirmButtonColor: "#e63946",   
      });

      setJobs((prev) =>
        prev.map((job) => (job.jobId === jobId ? { ...job, status: "Cancelled" } : job))
      );
      window.location.reload();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Cancel Failed",
        text: "Something went wrong while cancelling the job. Try again!",
        confirmButtonColor: "#e63946",   
      });
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    if (filter !== "All" && job.status?.toLowerCase() !== filter.toLowerCase()) return false;
    if (searchTerm.trim() !== "") {
      const s = searchTerm.toLowerCase();
      return (
        job.maidName?.toLowerCase().includes(s) ||
        job.maidWallet?.toLowerCase().includes(s) ||
        job.employerWallet?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Shorten wallet
  const shortenAddress = (address) => (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "");

  return (
    <div className="admin-container"> {/* ✅ Same layout as AdminDashboard/MaidManagement */}
      {/* Sidebar */}
      <Sidebar wallet={wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Not Connected"} role="Admin" />

      {/* Main Content */}
      <div className="dashboard">
        <h2>Job Management</h2>

        {/* Search + Filter */}
        <div className="maid-search">
          <input
            type="text"
            placeholder="Search by Maid Name or Wallet"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Paid</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Job Table */}
        <div className="maid-infos">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Job ID</th>
                <th>Maid</th>
                <th>Maid Wallet</th>
                <th>Employer Wallet</th>
                <th>Amount (ETH)</th>
                <th>Status</th>
                <th>TxHash</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <tr key={job._id}>
                    <td>{index + 1}</td>
                    <td>{job.jobId}</td>
                    <td>{job.maidName}</td>
                    <td>{shortenAddress(job.maidWallet)}</td>
                    <td>{shortenAddress(job.employerWallet)}</td>
                    <td>{job.amountEth}</td>
                    <td>
                      <span className={`status ${job.status?.toLowerCase()}`}>{job.status}</span>
                    </td>
                    <td>
                      {job.txHash ? (
                        <a href={`https://sepolia.etherscan.io/tx/${job.txHash}`} target="_blank" rel="noreferrer">
                          View Tx
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="action-buttons">
                      <button className="view-btn" onClick={() => navigate(`/view-profile/${job.maidWallet}`)}>
                        View Details
                      </button>
                      <button className="cancel-btn" onClick={() => cancelJob(job.jobId)}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "gray" }}>
                    No jobs found.
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

export default JobManagement;
