import React, { useState, useEffect } from 'react';
import "./CreateJob.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import axios from "axios";
import Swal from "sweetalert2"; // 💎 Import SweetAlert2

import getContract from '../../config/contract';
import {useApi} from "../context/ApiContext";


const CreateJob = () => {
  const {BASE_URL} = useApi();

  const location = useLocation();
  const navigate = useNavigate();
  const { maidWallet } = location.state || {}; // Maid wallet passed from previous page

  const [jobDesc, setJobDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Get MetaMask signer wallet (employer wallet)
  const getEmployerWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wallet = await signer.getAddress();
      return { provider, signer, wallet };
    } else {
      Swal.fire({
        icon: "warning",
        title: "MetaMask Required",
        text: "Please install MetaMask to continue!",
         confirmButtonColor: "#e63946",   
      });
      throw new Error("MetaMask not installed");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!maidWallet) return Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Maid wallet address not found.",
        confirmButtonColor: "#d33",
      });

  if (!jobDesc || !amount || !startDate)
     return Swal.fire({
        icon: "warning",
        title: "Incomplete Fields",
        text: "Please fill all required fields.",
         confirmButtonColor: "#e63946",   
      }); 
  try {
    const { provider, signer, wallet: employerWallet } = await getEmployerWallet();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo || !userInfo.email) {

        Swal.fire({
          icon: "info",
          title: "Login Required",
          text: "Please login first to continue.",
         confirmButtonColor: "#e63946",   
        });

      navigate("/employ-register");
      return;
    }

    const checkEmployer = await axios.get(
      `${BASE_URL}/api/users/check/register?email=${userInfo.email}`
    );
    if (!checkEmployer.data.exists) {
      Swal.fire({
          icon: "info",
          title: "Employer Not Registered",
          text: "Please register as an employer before hiring.",
         confirmButtonColor: "#e63946",   
        });

      navigate("/register");
      return;
    }

    const amountInWei = ethers.parseEther(amount.toString());

    // 1️⃣ Upload job JSON to Pinata
    const res = await axios.post(`${BASE_URL}/api/jobs/upload`, {
      maidWallet,
      employerWallet,
      jobDesc,
      jobType: "Full Time",
      startDate,
      amountWei: amountInWei.toString(),
      amountEth: amount
    });

    const { ipfsHash } = res.data;
    if (!ipfsHash) {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Unable to upload job details to IPFS.",
          confirmButtonColor: "#d33",
        });
        return;
      }

    // 2️⃣ Call smart contract (job created on-chain)
    const { contract } = await getContract();
    const tx = await contract.createJob(maidWallet, ipfsHash, { value: amountInWei });
    const receipt = await tx.wait();

    const txHash = receipt.hash;

    // 🔍 Extract actual on-chain jobId
    const event = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e && e.name === "JobCreated");

    const jobId = event ? Number(event.args.jobId) : null;

    // 3️⃣ Save in backend
    await axios.post(`${BASE_URL}/api/jobs/save`, {
      maidWallet,
      employerWallet,
      employerEmail: userInfo.email,
      jobDesc,
      jobType: "Full Time",
      startDate,
      amountWei: amountInWei.toString(),
      amountEth: amount,
      txHash,
      ipfsHash,
      jobId, // ✅ real blockchain jobId
    });

    Swal.fire({
        icon: "success",
        title: "Maid Hired Successfully! 🎉",
        text: "Your job has been created and stored on blockchain.",
         confirmButtonColor: "#e63946",   
      }).then(() => navigate("/"));

  } catch (err) {
    console.error("❌ Error hiring maid:", err);
    Swal.fire({
        icon: "error",
        title: "Transaction Failed",
        text: "Something went wrong while hiring maid. Check console for details.",
        confirmButtonColor: "#d33",
      });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="post-job-container">
      <h2>Hire a Maid</h2>
      <p>
        Please provide the details below to confirm your hiring request.
        Maid and Employer wallet addresses will be automatically linked.
      </p>

      <form className="post-job-form" onSubmit={handleSubmit}>
        <label>Job Description</label>
        <textarea
          placeholder="Describe the job..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          required
        />

        <label>Salary Offered (in ETH)</label>
        <input
          type="number"
          placeholder="Enter amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <div className="form-buttons">
          <button type="submit" className="btn-primarys" disabled={loading}>
            {loading ? "Processing..." : "Confirm"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
