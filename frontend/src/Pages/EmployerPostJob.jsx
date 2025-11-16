import React, { useState, useEffect } from "react";
import axios from "axios";
import getContract from "../../config/contract";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEye } from "react-icons/fa";
import Swal from "sweetalert2"; 

import "./EmployerPostJob.css";

import {useApi} from "../context/ApiContext";


const EmployerPostJob = () => {
  const {BASE_URL} = useApi();

  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [account, setAccount] = useState("");
  const [filter, setFilter] = useState("All");
  const [loadingJobId, setLoadingJobId] = useState(null); // Track loading for each job

  // 🔹 Connect MetaMask wallet
  useEffect(() => {
    const getAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0].toLowerCase());
      } else {
      Swal.fire({
          icon: "warning",
          title: "MetaMask Required",
          text: "Please install MetaMask to continue!",
         confirmButtonColor: "#e63946",   
        });      
      }
    };
    getAccount();
  }, []);

  // 🔹 Fetch jobs of employer
  const fetchJobs = async () => {
    if (!account) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/api/jobs/employer/${account}`
      );
      setJobs(res.data.jobs || res.data || []);
    } catch (err) {
      console.error("Error fetching employer jobs:", err.message);
       Swal.fire({
        icon: "error",
        title: "Failed to Fetch Jobs",
        text: "Could not load job data. Please try again later.",
         confirmButtonColor: "#e63946",   
      });
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [account]);


  // 🔹 Confirm job
  const employerConfirm = async (job) => {
    try {
      if (!account) {
        return Swal.fire({
          icon: "info",
          title: "Wallet Not Connected",
          text: "Connect MetaMask to continue!",
         confirmButtonColor: "#e63946",   
        });      
      }

      // ✅ Check connected wallet matches employer wallet
      if (account.toLowerCase() !== job.employerWallet.toLowerCase()) {
        return Swal.fire({
          icon: "warning",
          title: "Wrong Wallet",
          text: "Please switch MetaMask to the employer wallet used for this job!",
         confirmButtonColor: "#e63946",   
        });
      }

    setLoadingJobId({ jobId: job.jobId, action: "confirm" });

      // ✅ Interact with blockchain first
      const { contract } = await getContract(); // contract already signer-connected
      if (!contract) {
        Swal.fire({
          icon: "error",
          title: "Contract Not Loaded",
          text: "Smart contract not found. Try reloading the page.",
         confirmButtonColor: "#e63946",   
        });        
        setLoadingJobId(null);
        return;
      }

      const tx = await contract.employerConfirmJob(job.jobId);
      await tx.wait();
       Swal.fire({
        icon: "success",
        title: "Job Confirmed ✅",
        text: "The job has been successfully confirmed on blockchain!",
         confirmButtonColor: "#e63946",   
      });

      // ✅ Update backend after blockchain success
      await axios.put(`${BASE_URL}/api/jobs/${job._id}/employ-mark`);

      // ✅ Refresh jobs
      fetchJobs();
    } catch (err) {
      console.error("Employer confirmation failed:", err);
       Swal.fire({
        icon: "error",
        title: "Transaction Failed",
        text: "Something went wrong during blockchain transaction. Try again!",
         confirmButtonColor: "#e63946",   
      });
    } finally {
      setLoadingJobId(null);
    }
  };

  //cancel job
const cancelJob = async (job, jobMongoId) => {
  try {
    if (!account) {
      return Swal.fire({
          icon: "info",
          title: "Wallet Not Connected",
          text: "Please connect MetaMask first!",
         confirmButtonColor: "#e63946",   
        });
    }

    if (!job.employerWallet) {
      return Swal.fire({
          icon: "error",
          title: "Missing Data",
          text: "Employer wallet not found in job record.",
         confirmButtonColor: "#e63946",   
        });
    }

    if (account.toLowerCase() !== job.employerWallet.toLowerCase()) {
          return Swal.fire({
          icon: "warning",
          title: "Wrong Wallet",
          text: "Switch MetaMask to the employer wallet used for this job.",
         confirmButtonColor: "#e63946",   
        });    
      }

      // Confirm cancel action
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

    setLoadingJobId({ jobId: job.jobId, action: "cancel" });

    const { contract } = await getContract();
    if (!contract) {
    Swal.fire({
          icon: "error",
          title: "Contract Not Loaded",
          text: "Smart contract not found.",
        confirmButtonColor: "#e63946",   
     });

      setLoadingJobId(null);
      return;
      
    }

    const tx = await contract.cancelJob(job.jobId);
    await tx.wait();
 Swal.fire({
        icon: "success",
        title: "Job Cancelled ❌",
        text: "The job has been successfully cancelled on blockchain.",
        confirmButtonColor: "#e63946",   
      });

    await axios.put(`${BASE_URL}/api/jobs/cancel/${job.jobId}`);
    fetchJobs();
  } catch (err) {
    console.error("Employer cancel job failed:", err);
    Swal.fire({
        icon: "error",
        title: "Cancel Failed",
        text: "Something went wrong while cancelling the job. Try again!",
        confirmButtonColor: "#e63946",   
      });
  } finally {
    setLoadingJobId(null);
  }
};




  // 🔹 Filter jobs
  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((job) => job.status === filter);

  return (
    <div className="employer-page-container">
      {/* Hero Header */}
      <div className="employer-hero">
        <h1>
          Your <span>Posted Jobs</span>
        </h1>
        <p>Track, manage, and confirm all your job postings efficiently.</p>
      </div>

      {/* Filter Buttons */}
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

      {/* Job Table */}
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Maid Name</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>Salary (ETH)</th>
              <th>Work Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.jobId}>
                  <td>{job.jobId}</td>
                  <td>{job.maid?.fullName || "N/A"}</td>
                  <td>{job.jobDesc}</td>
                  <td>
                    {job.startDate
                      ? new Date(job.startDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{job.amountEth}</td>
                  <td>{job.jobType}</td>
                  <td>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="confirm-btn"
                      onClick={() => employerConfirm(job)}
                      disabled={
                        job.status.toLowerCase() === "completed" ||
                        loadingJobId === job.jobId && loading.action === "confirm"
                      }
                    >
                      {loadingJobId === job.jobId  && loading.action === "confirm" ? "Processing..." : <><FaCheckCircle /> Confirm</>}
                    </button>
                    

                      {/* //cancel job btn  */}
                      <button className="job-cancel" onClick={() => cancelJob(job, job._id)}
                      disabled={
                       job.status.toLowerCase() !== "active" ||
                        loadingJobId === job.jobId && loading.action === "cancel"
                         }
                        >
                     {loadingJobId === job.jobId  && loading.action === "cancel" ? "Processing..." : "Cancel"}</button>


                    <button
                      className="view-btn"
                      onClick={() => navigate(`/view-profile/${job.maidWallet}`)}
                    >
                      <FaEye /> View
                    </button>

                  

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-jobs">
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerPostJob;
