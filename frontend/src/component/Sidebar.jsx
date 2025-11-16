import React, { useState, useEffect } from "react";
import { FaUser, FaBriefcase, FaHome, FaUsers, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Sidebar.css";

const Sidebar = ({ role }) => {
  const [wallet, setWallet] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const savedWallet = localStorage.getItem("adminWallet");
        if (savedWallet) {
          setWallet(savedWallet);
        } else if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            localStorage.setItem("adminWallet", accounts[0]);
            Swal.fire({
              icon: "success",
              title: "Wallet Connected",
              text: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
            });
          }
        } else {
          Swal.fire({
            icon: "warning",
            title: "MetaMask Not Detected",
            text: "Please install MetaMask to continue.",
          });
        }
      } catch (err) {
        console.error("Wallet connection error:", err);
      }
    };
    connectWallet();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#666",
      confirmButtonText: "Yes, Logout",
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem("adminWallet");
        setWallet(null);
        Swal.fire("Logged out!", "", "success");
      }
    });
  };

  return (
    <>
      {/* Menu Button */}
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FaBars />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "active" : ""}`}>
        <h2 className="sidebar-title">Admin  Dashboard</h2>
        <ul className="sidebar-menu">
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>
              <FaHome className="sidebar-icon" /> Home
            </Link>
          </li>
          <li>
            <Link to="/admin-dash" onClick={() => setIsOpen(false)}>
              <FaBriefcase className="sidebar-icon" /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/Job-manage" onClick={() => setIsOpen(false)}>
              <FaUsers className="sidebar-icon" /> Job Management
            </Link>
          </li>
          <li>
            <Link to="/maid-manage" onClick={() => setIsOpen(false)}>
              <FaUser className="sidebar-icon" /> Maid Management
            </Link>
          </li>
        </ul>

        <div className="wallet-btn">
          <p>Admin Wallet: {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Not Connected"}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
