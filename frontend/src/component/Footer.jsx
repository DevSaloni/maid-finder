import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaInstagram, FaGithub, FaTwitter } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">

      {/* Brand */}
      <div className="footer-brand">
        <h1>SheWorks</h1>
        <p>Connecting Homes with Trusted Maids, Powered by Decentralization</p>
      </div>

      {/* Quick Links */}
      <div className="footer-links">
        <h4>Quick Links</h4>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>

      {/* Employers */}
      <div className="footer-links">
        <h4>Employers</h4>
        <ul>
          <li><Link to="/create-job">Post Job</Link></li>
          <li><Link to="/search-maid">Find Maid</Link></li>
        </ul>
      </div>

      {/* Maids */}
      <div className="footer-links">
        <h4>Maids</h4>
        <ul>
          <li><Link to="/register-maid">Register</Link></li>
          <li><Link to="/my-jobs">My Jobs</Link></li>
        </ul>
      </div>

      {/* Contact */}
      <div className="footer-contact">
        <h4>Contact</h4>
        <p>Email: support@sheworks.com</p>
        <p>Phone: +91 9876543210</p>
      </div>

      {/* Social Media */}
      <div className="footer-social">
        <h4>Follow Us</h4>
        <div className="social-icons">
          <a href="#"><FaLinkedin /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaGithub /></a>
          <a href="#"><FaTwitter /></a>
        </div>
      </div>

      {/* Bottom Copy */}
      <div className="footer-bottom">
        <p>© 2025 SheWorks. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
