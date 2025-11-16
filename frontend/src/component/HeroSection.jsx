import React from 'react';
import "./HeroSection.css";
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate= useNavigate();

  return (
    <div className="hero-container">
      <div className="hero-content">
        {/* Text Section */}
        <div className="hero-text">
          <h1>
            This is a <span>Decentralized Platform</span> helping maids
          </h1>
          <p>
            Our platform empowers maids to find jobs easily, ensures fairness through decentralization, 
            and also guides those with knowledge of Web3.
          </p>
          <div className="hero-btn">
            <button onClick={() => navigate("/register-maid")}>Get Started<span className="arrow">&#8594;</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
