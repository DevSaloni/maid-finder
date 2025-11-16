import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Navbar.css";

const Navbar = () => {
  const [openDropdown, setOpenDropDown] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (savedUser) setUserInfo(savedUser);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropDown(openDropdown === menu ? null : menu);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        Swal.fire({
          icon: "warning",
          title: "MetaMask Not Detected",
          text: "Please install MetaMask to connect your wallet.",
        confirmButtonColor: "#e63946",   
        });
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);

      Swal.fire({
        icon: "success",
        title: "Wallet Connected",
        text: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        confirmButtonColor: "#e63946",   
      });
    } catch (err) {
      console.error("Error connecting wallet:", err);
      Swal.fire({
        icon: "error",
        title: "Connection Failed",
        text: "Something went wrong while connecting to MetaMask.",
        confirmButtonColor: "#e63946",   
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "green",
      cancelButtonColor: "#e63946",
      confirmButtonText: "Yes, Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userInfo");
        setUserInfo({ name: "", email: "" });
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have logged out successfully!",
        confirmButtonColor: "#e63946",   
        });
      }
    });
  };

  const shortAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <nav className="navbar">
      {/* 🍔 Menu Icon for mobile */}
      <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        ☰
      </div>

      {/* 💖 Website Logo */}
      <div className="nav-logo">SheWorks</div>

      {/* 🔗 Navigation Links */}
      <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>

        {/* Employer Dropdown */}
        <li
          className={`nav-item dropdown ${openDropdown === "employer" ? "active" : ""}`}
          onClick={() => toggleDropdown("employer")}
        >
          <span className="nav-link">
            Employer <span className="arrow">▼</span>
          </span>
          <ul className="dropdown-menu">
            <li><Link to="/search-maid">Find Maid</Link></li>
            <li><Link to="/post-jobs">Jobs</Link></li>
          </ul>
        </li>

        {/* Maid Dropdown */}
        <li
          className={`nav-item dropdown ${openDropdown === "maid" ? "active" : ""}`}
          onClick={() => toggleDropdown("maid")}
        >
          <span className="nav-link">
            Maid <span className="arrow">▼</span>
          </span>
          <ul className="dropdown-menu">
            <li><Link to="/register-maid">Register</Link></li>
            <li><Link to="/my-jobs">My Jobs</Link></li>
          </ul>
        </li>

        {/* Admin Dropdown */}
        <li
          className={`nav-item dropdown ${openDropdown === "admin" ? "active" : ""}`}
          onClick={() => toggleDropdown("admin")}
        >
          <span className="nav-link">
            Admin <span className="arrow">▼</span>
          </span>
          <ul className="dropdown-menu">
            <li><Link to="/admin">Dashboard</Link></li>
          </ul>
        </li>
      </ul>

      {/* 🪙 Wallet Button */}
     <div className="nav-right">
        {walletAddress ? (
          <span className="wallet-address">{shortAddress(walletAddress)}</span>
        ) : (
          <button className="wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {userInfo.name ? (
          <div
            className="profile-icon"
            onClick={() => setShowProfile(!showProfile)}
          >
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <img
            src="/images/userprofile.png"
            className="profile-icon"
            alt="Profile"
            onClick={() => setShowProfile(!showProfile)}
          />
        )}
      </div>


      {showProfile && (
        <div className="profile-dropdown">
          <p><strong>{userInfo.name || "Guest User"}</strong></p>
          <p className="role">{userInfo.email || "Not assigned"}</p>
          {walletAddress && <p>{shortAddress(walletAddress)}</p>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
