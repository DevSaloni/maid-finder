import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "./CallToAction.css";

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <div className="call-container">
      {/* Overlay for darkening the background */}
      <div className="overlay"></div>
      
      {/* Text box */}
      <div className="text">
        <h1>Hire Maids, Safe Payments, Verified by SheWorks</h1>
        <button className="cta-btn" onClick={() => navigate("/search-maid")}>
          Hire Now
        </button>
        <p>
          Are you a Maid?{" "}
          <Link to="/register-maid" className="register-link">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CallToAction;
