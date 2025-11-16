import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./ViewProfile.css";
import { useApi } from "../context/ApiContext";

const ViewProfile = ({ role = "maid" }) => {
  const { BASE_URL } = useApi();
  const navigate = useNavigate();
  const { wallet } = useParams();

  const [account, setAccount] = useState(null);
  const [maid, setMaid] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dropdown states
  const [showPersonal, setShowPersonal] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [showHireData, setShowHireData] = useState(false);

  // Get connected wallet
  useEffect(() => {
    const getAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0].toLowerCase());
      }
    };
    getAccount();
  }, []);

  // Fetch profile
  useEffect(() => {
    const targetWallet = role === "employer" ? wallet : account;
    if (!targetWallet) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/jobs/profile/${targetWallet}`);
        setMaid(res.data.maid);
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [account, wallet, role]);

  // SHOW LOADER
  if (loading)
    return (
      <div className="loader-wrapper">
        <div className="loader"></div>
        <p>Loading Profile...</p>
      </div>
    );

  if (!maid) return <p>No maid found.</p>;

  return (
    <div className="profile-layout">
      {/* LEFT SIDEBAR */}
      <div className="profile-sidebar">
        <div className="maid-info-card">
          <img
            src={`https://ipfs.io/ipfs/${maid.profilePhoto}`}
            alt="maid"
            className="maid-avatar"
          />
          <h2>{maid.fullName}</h2>
          <p>{maid.location}</p>
          <p className="wallet-text">
            {maid.wallet.slice(0, 6)}...{maid.wallet.slice(-4)}
          </p>
          <button className="profile-status">
            {maid.isVerified ? "Verified" : "Unverified"}
          </button>
        </div>

        {/* Personal Info */}
        <div className="dropdown-section">
          <div
            className="dropdown-header"
            onClick={() => setShowPersonal(!showPersonal)}
          >
            <h3>Personal Info</h3>
            <span className={`arrow ${showPersonal ? "open" : ""}`}>&#9662;</span>
          </div>
          {showPersonal && (
            <div className="dropdown-content">
              <p><strong>Age:</strong> {maid.age}</p>
              <p><strong>Experience:</strong> {maid.experience} year</p>
              <p><strong>Work Type:</strong> {maid.workType}</p>
              <p><strong>Job Type:</strong> {maid.jobType}</p>
              <p><strong>Salary:</strong> ₹{maid.salaryAmount} / {maid.salaryType}</p>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="dropdown-section">
          <div
            className="dropdown-header"
            onClick={() => setShowBio(!showBio)}
          >
            <h3>About Me</h3>
            <span className={`arrow ${showBio ? "open" : ""}`}>&#9662;</span>
          </div>
          {showBio && (
            <div className="dropdown-content">
              <p>{maid.bio}</p>
            </div>
          )}
        </div>

        {/* Hired By */}
        <div className="dropdown-section">
          <div
            className="dropdown-header"
            onClick={() => setShowHireData(!showHireData)}
          >
            <h3>Hired Me</h3>
            <span className={`arrow ${showHireData ? "open" : ""}`}>&#9662;</span>
          </div>

          {showHireData && maid.hiredBy ? (
            <div className="dropdown-content">
              <p><strong>Name:</strong> {maid.hiredBy.fullName}</p>
              <p><strong>Email:</strong> {maid.hiredBy.email}</p>
              <p><strong>Phone:</strong> {maid.hiredBy.phone}</p>
              <p><strong>Address:</strong> {maid.hiredBy.address}</p>
            </div>
          ) : showHireData ? (
            <div className="dropdown-content">
              <p>No employer has hired this maid yet.</p>
            </div>
          ) : null}
        </div>

        {/* BUTTONS */}
        <div className="maid-buttons">
          {role === "employer" ? (
            <>
              <button className="back-btn" onClick={() => window.history.back()}>
                Back
              </button>
            </>
          ) : (
            <>
              <button className="edit-btn">Edit Profile</button>
              <button className="back-btn" onClick={() => window.history.back()}>
                Back
              </button>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="profile-main">
        <h2>Job History</h2>

        <div className="job-table-wrapper">
          <table className="job-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Employer</th>
                <th>Status</th>
                <th>Job Type</th>
                <th>Amount (ETH)</th>
              </tr>
            </thead>

            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.jobId}</td>
                    <td>
                      {job.employerWallet.slice(0, 6)}...
                      {job.employerWallet.slice(-4)}
                    </td>
                    <td data-status={job.status}>{job.status}</td>
                    <td>{job.jobType}</td>
                    <td>{job.amountEth}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No previous jobs</td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
