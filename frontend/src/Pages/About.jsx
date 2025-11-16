import React from 'react';
import { FaLock, FaUsers, FaLightbulb, FaHeart, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import {useNavigate} from "react-router-dom";


import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      
      {/* ---- HERO SECTION ---- */}
      <div className="about-content">
        <h1>
          Get To Know <span>SheWorks</span>
        </h1>
        <p className="about-intro">
          Empowering women by connecting skilled maids with trusted employers through technology and care.
        </p>
        <button className="start-btn" onClick={()=> navigate("/register-maid")}>Get Started</button>
      </div>

      {/* ---- MISSION ---- */}
      <div className="our-mission">
        <h2>Our Mission & Vision</h2>
        <p>
          <strong>Mission:</strong> To empower women by providing safe, reliable, and verified work opportunities.
        </p>
        <p>
          <strong>Vision:</strong> To build a transparent ecosystem where employers and maids collaborate confidently.
        </p>
      </div>

      {/* ---- VALUES ---- */}
      <div className="our-value">
        <h2>Our Core Values</h2>
        <p><strong> <FaLock/>Trust & Security:</strong> Verified profiles and transparent hiring process.</p>
        <p><strong><FaUsers/> Community:</strong> Supporting women and creating meaningful relationships.</p>
        <p><strong><FaLightbulb/>Invoation:</strong> Using modern technology for faster, smarter hiring.</p>
        <p><strong><FaHeart/> Empathy & Care:</strong> Respectful and fair treatment for everyone.</p>
      </div>

      {/* ---- HOW IT WORKS ---- */}
      <div className="work-process">
        <h2>How It Works</h2>
        <div className="timeline">
          <div className="timeline-item">1️⃣ Register as Maid, User, or Admin.</div>
          <div className="timeline-item">2️⃣ Admin verifies Maid profiles for authenticity.</div>
          <div className="timeline-item">3️⃣ Users search Maids using filters (location, skills, etc.).</div>
          <div className="timeline-item">4️⃣ User hires Maid after review and chat confirmation.</div>
          <div className="timeline-item">5️⃣ Both confirm agreement & job details.</div>
          <div className="timeline-item">6️⃣ Secure payment processed safely.</div>
        </div>
      </div>

      {/* ---- CONTACT ---- */}
      <div className="connect">
        <h2>Get in Touch</h2>
        <p>We’d love to hear from you!</p>
        <p><FaEnvelope className="icon" /> sheworks@gmail.com</p>
        <p><FaPhoneAlt className="icon" /> +91 9876543210</p>
        <Link to="/contact" className="contact-link">CONTACT US</Link>
      </div>
    </div>
  );
};

export default About;
