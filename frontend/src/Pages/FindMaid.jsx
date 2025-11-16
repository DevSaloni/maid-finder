import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./FindMaid.css";
import { useNavigate } from "react-router-dom";
import {useApi} from "../context/ApiContext";


const FindMaid = () => {
  const {BASE_URL} = useApi();


  const navigate = useNavigate();

  const [maids, setMaids] = useState([]); // all maids fetched
  const [filteredMaids, setFilteredMaids] = useState([]); // filtered list
  const [filters, setFilters] = useState({
    location: "All",
    skill: "All",
    salary: "",
    salaryType: "All",
    jobType: "All",
  });

  // Fetch all maids from backend
  useEffect(() => {
    const fetchMaids = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/maids/all`);
        setMaids(res.data);
        setFilteredMaids(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMaids();
  }, []);

  // Apply filters whenever filters or maids change
  useEffect(() => {
    let temp = [...maids];

    // Location filter
    // Location filter (case-insensitive)
if (filters.location !== "All") {
  temp = temp.filter(
    (m) =>
      m.location?.trim().toLowerCase() ===
      filters.location.trim().toLowerCase()
  );
}


    // Skill filter (case-insensitive, supports partial match)
    if (filters.skill !== "All") {
      temp = temp.filter((m) =>
        m.workType.toLowerCase().includes(filters.skill.toLowerCase())
      );
    }

    // Salary filter
    if (filters.salary) {
      temp = temp.filter(
        (m) => Number(m.salaryAmount) <= Number(filters.salary)
      );
    }

    // Salary type filter
    if (filters.salaryType !== "All") {
      temp = temp.filter(
        (m) => m.salaryType.toLowerCase() === filters.salaryType.toLowerCase()
      );
    }

    // Job type filter
    if (filters.jobType !== "All") {
      temp = temp.filter(
        (m) =>
          m.jobType.replace("-", " ").toLowerCase() ===
          filters.jobType.toLowerCase()
      );
    }

    // Only show verified maids
    temp = temp.filter((m) => m.isVerified === "Verified");

    setFilteredMaids(temp);
  }, [filters, maids]);

  return (
    <div className="find-maid-container">
      <h2>Find Maid</h2>
      <p>Browse Verified Maids and Hire Directly</p>
    
    <div className="search-field">
  <div className="select-wrapper">
    <select onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
      <option value="All">All Locations</option>
      <option value="Mumbai">Mumbai</option>
      <option value="Pune">Pune</option>
      <option value="Bangalore">Bangalore</option>
    </select>
  </div>

  <div className="select-wrapper">
    <select onChange={(e) => setFilters({ ...filters, skill: e.target.value })}>
      <option value="All">All Skills</option>
      <option value="Baby Care">Baby Care</option>
      <option value="Senior Care">Senior Care</option>
      <option value="Cooking">Cooking</option>
      <option value="Housekeeping">Housekeeping</option>
    </select>
  </div>

  <input
    type="number"
    placeholder="Salary Range"
    onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
  />

  <div className="select-wrapper">
    <select onChange={(e) => setFilters({ ...filters, salaryType: e.target.value })}>
      <option value="All">All Salary Type</option>
      <option value="Monthly">Monthly</option>
      <option value="Weekly">Weekly</option>
      <option value="Hourly">Hourly</option>
    </select>
  </div>

  <div className="select-wrapper">
    <select onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}>
      <option value="All">All Types</option>
      <option value="Full Time">Full Time</option>
      <option value="Part Time">Part Time</option>
    </select>
  </div>
</div>


      {/* Maid Cards */}
      <div className="maid-cards">
        {filteredMaids.length === 0 && (
          <p>No verified maids found with these filters.</p>
        )}

        {filteredMaids.map((maid) => (
          <div className="maid-card" key={maid.wallet || maid._id}>
          <div className="profile-image"> 
             <img 
      src={
        maid.profilePhoto
          ? `https://gateway.pinata.cloud/ipfs/${maid.profilePhoto}`
          : "/images/userprofile.png"
      }
      alt={maid.fullName}
    />
    </div>
            <h3>
              <span>Name: </span>
              {maid.fullName}
            </h3>
            <p>
              <span>Age: </span>
              {maid.age}
            </p>
            <p>
              <span>Location: </span>
              {maid.location}
            </p>
            <p>
              <span>Key Skills: </span>
              {maid.workType}
            </p>
            <p>
              <span>Experience: </span>
              {maid.experience} years
            </p>
            <p>
              <span>Salary: </span>
              {maid.salaryAmount} ({maid.salaryType})
            </p>
            <p>
              <span>Verification Status: </span>
              {maid.isVerified}
            </p>
            <p>
              <span>Status: </span>
              {maid.status}
            </p>
            <div className="maid-card-btn">
              <button  onClick={()=> navigate(`/view-profile/${maid.wallet}`)}>View Profile</button>
              
              {/* Hire Button with Status Check */}
              {maid.status === "free" ? (
                <button 
                  className="hire-btn"
                  onClick={() => navigate("/create-job", { state: { maidWallet: maid.wallet } })}
                >
                  Hire Now
                </button>
              ) : (
                <button className="hired-btn" disabled>
                  Already Hired
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindMaid;
