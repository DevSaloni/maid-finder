import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import getContract from "../../config/contract";
import Swal from "sweetalert2"; 

import "./MaidJobs.css";
import {useApi} from "../context/ApiContext";

const MaidJobs = () => {
  const {BASE_URL} = useApi();

  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [account, setAccount] = useState("");
  const [filter, setFilter] = useState("All");
  const [loadingJobId, setLoadingJobId] = useState(null); // track loading per job

  // 🔹 Get MetaMask account
  useEffect(() => {
    const getAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0].toLowerCase());
        } catch (err) {
           Swal.fire({
            icon: "error",
            title: "MetaMask Error",
            text: "Please unlock MetaMask or try again.",
        confirmButtonColor: "#e63946",   
          });
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "MetaMask Missing",
          text: "Please install MetaMask to continue!",
        confirmButtonColor: "#e63946",   
        });          
      }
    };
    getAccount();
  }, []);

  // 🔹 Fetch maid jobs from backend
  const fetchJobs = async () => {
    if (!account) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/api/jobs/maid/${account}`
      );
      setJobs(res.data.jobs || res.data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: "Failed to load maid jobs. Please try again later.",
        confirmButtonColor: "#e63946",   
      });
      console.error("Error fetching maid jobs:", err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [account]);

  // 🔹 Maid confirms job
  const maidConfirm = async (job) => {
    try {
      if (account.toLowerCase() !== job.maidWallet.toLowerCase()) {
       Swal.fire({
          icon: "error",
          title: "Wrong Wallet",
          text: "Please switch MetaMask to the maid's wallet before confirming.",
        confirmButtonColor: "#e63946",   
        });
        return;
      }

      setLoadingJobId(job.jobId);

      // ✅ Confirm job on blockchain first
      const { contract } = await getContract();
      if (!contract) {
        Swal.fire({
          icon: "error",
          title: "Contract Error",
          text: "Smart contract not loaded properly!",
        confirmButtonColor: "#e63946",   
        });
        setLoadingJobId(null);
        return;
      }

      const tx = await contract.maidConfirmJob(job.jobId);
      await tx.wait();
      Swal.fire({
        icon: "success",
        title: "Job Confirmed",
        text: "✅ Job confirmed by maid on blockchain!",
        confirmButtonColor: "#28a745",
      });
      // ✅ Then update backend
      await axios.put(`${BASE_URL}/api/jobs/${job._id}/maid-confirm`);

      // ✅ Refresh jobs
      fetchJobs();
    } catch (err) {
      console.error("Maid blockchain confirm failed:", err);
      Swal.fire({
        icon: "error",
        title: "Transaction Failed",
        text: "Blockchain transaction failed. Please check MetaMask!",
        confirmButtonColor: "#e63946",   
      });
    } finally {
      setLoadingJobId(null);
    }
  };

  // 🔹 Shorten wallet addresses
  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 🔹 Filter jobs
  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((job) => job.status === filter);

  return (
    <div className="maid-job-container">
      <div className="maid-hero">
        <h1>My <span>Jobs</span></h1>
        <p className="subtitle">
          Track your ongoing, completed, and cancelled jobs in one place
        </p>
      </div>

      {/* Filter Section */}
      <div className="filter">
        {["All", "Active", "Paid", "Cancelled"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Job List Section */}
      <div className="job-list">
        <table>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Employer</th>
              <th>Amount</th>
              <th>Start date</th>
              <th>Work Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.jobId}</td>
                  <td>{job.employerName || shortenAddress(job.employerWallet)}</td>
                  <td>{job.amountEth} ETH</td>
                  <td>
                    {job.startDate ? new Date(job.startDate).toLocaleDateString() : "—"}
                  </td>
                  <td>{job.jobType}</td>
                  <td>
                    <span className={`status ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                      <div className="action-buttons">
                    <button
                      className="btn-primarys"
                      onClick={() => maidConfirm(job)}
                      disabled={
                        job.status.toLowerCase() === "paid" ||
                        loadingJobId === job.jobId
                      }
                    >
                      {loadingJobId === job.jobId ? "Processing..." : "Confirm"}
                    </button>
                    <button onClick={() => navigate(`/view-profile/${account}`)}>
                      View Details
                    </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No jobs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaidJobs;
