import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../component/Sidebar";
import "./AdminDashboard.css";
import {useApi} from "../context/ApiContext";

const AdminDashboard = () => {
  const {BASE_URL} = useApi();
  
  const [jobs, setJobs] = useState([]);
  const [maids, setMaids] = useState([]);

  useEffect(() => {
    const getAllRecentMaids = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/maids/all`);
        setMaids(res.data.slice(-5).reverse());
      } catch (err) {
        console.error("Error fetching maids:", err.message);
      }
    };
    getAllRecentMaids();
  }, []);

  useEffect(() => {
    const getAllRecentJobs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/jobs/all`);
        setJobs(res.data.slice(-5).reverse());
      } catch (err) {
        console.error("Error fetching jobs:", err.message);
      }
    };
    getAllRecentJobs();
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar fixed below navbar */}
      <Sidebar role="Admin" />

      {/* Main Dashboard Content */}
      <div className="admin-dashboard-content">
        <header className="dashboard-header">
          <h2>Admin Dashboard</h2>
        </header>

        {/* Overview Section */}
        <section className="dash-overview">
          <h2>Overview</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <p className="count">{maids.length}</p>
              <p>Total Maids Registered</p>
            </div>
            <div className="summary-card">
              <p className="count">
                {maids.filter((m) => m.status === "Verified").length}
              </p>
              <p>Verified Maids</p>
            </div>
            <div className="summary-card">
              <p className="count">{jobs.length}</p>
              <p>Total Jobs Created</p>
            </div>
            <div className="summary-card">
              <p className="count">
                {jobs.filter((j) => j.status === "Pending").length}
              </p>
              <p>Pending Verification</p>
            </div>
          </div>
        </section>

        {/* Recent Maids */}
        <section className="recent-post">
          <h2>Recent Maid Registrations</h2>
          <div className="recent-post-data">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {maids.length > 0 ? (
                  maids.map((maid, index) => (
                    <tr key={index}>
                      <td>{maid.fullName}</td>
                      <td>{maid.location || "N/A"}</td>
                      <td>{maid.status || "Pending"}</td>
                      <td>
                        {maid.createdAt
                          ? new Date(maid.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No maids found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Jobs */}
        <section className="recent-post">
          <h2>Recent Job Posts</h2>
          <div className="recent-post-data">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Employer Wallet</th>
                  <th>Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? (
                  jobs.map((job, index) => (
                    <tr key={index}>
                      <td>{job.jobDesc || "N/A"}</td>
                      <td>
                        {job.employerWallet
                          ? `${job.employerWallet.slice(0, 6)}...${job.employerWallet.slice(-4)}`
                          : "N/A"}
                      </td>
                      <td>{job.amountEth}</td>
                      <td>{job.status || "Pending"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
