import React from "react";
import { Link } from "react-router-dom";
import "./RegisterPanel.css";

const RegisterPanel = () => {
  return (
    <div className="register-panel">
      <h2 className="panel-heading">Join Us Today!</h2>

      <div className="register-options">
        {/* Background image as part of section */}
        <div className="register-card">
          <div className="card-content">
            <h3>Are You a User?</h3>
            <p>
              Register Here{" "}
              <Link to="/employ-register" className="register-link">
                Click Here
              </Link>
            </p>
          </div>
        </div>

        <div className="register-card">
          <div className="card-content">
            <h3>Are You an Maid?</h3>
            <p>
              Register Here{" "}
              <Link to="/register-maid" className="register-link">
                Click Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPanel;
