import React from "react";
import { FaUserShield, FaClock, FaHandshake, FaUsers } from "react-icons/fa";
import "./Features.css";
const Features = () => {
  return (
    <section className="features-section">
      <h2 className="feature-title">Why Choose SheWorks?</h2>
      <p className="feature-subtitle">
        We connect employers and maids securely, efficiently, and transparently.
      </p>

      <div className="feature-grid">
        <div className="feature-card">
          <FaUserShield className="feature-icon" />
          <h3>Verified Workers</h3>
          <p>All maids are verified through secure blockchain-backed profiles for trust and safety.</p>
        </div>

        <div className="feature-card">
          <FaClock className="feature-icon" />
          <h3>Instant Hiring</h3>
          <p>Employers can post jobs and hire maids instantly through a seamless dashboard.</p>
        </div>

        <div className="feature-card">
          <FaHandshake className="feature-icon" />
          <h3>Fair & Transparent</h3>
          <p>Our platform ensures fair payments and transparent communication between both parties.</p>
        </div>

        <div className="feature-card">
          <FaUsers className="feature-icon" />
          <h3>Admin Oversight</h3>
          <p>Admins monitor activities to maintain a safe and professional environment for all users.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
