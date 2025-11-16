import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import "./UserRegister.css";
import {useApi} from "../context/ApiContext";

const UserRegister = () => {
  const {BASE_URL} = useApi();

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    role: "employer",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🌸 Frontend Validation Before API Call
    if (formData.fullName.trim().length < 3) {
      document.querySelector("input[name='fullName']").focus();
      Swal.fire({
        icon: "warning",
        title: "Invalid Name",
        text: "Full name must be at least 3 characters long.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      document.querySelector("input[name='email']").focus();
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      document.querySelector("input[name='phone']").focus();
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 10 digits.",
      });
      return;
    }

    if (formData.password.length < 6) {
      document.querySelector("input[name='password']").focus();
      Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (formData.address.trim().length < 5) {
      document.querySelector("input[name='address']").focus();
      Swal.fire({
        icon: "warning",
        title: "Invalid Address",
        text: "Address must be at least 5 characters long.",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/register`,
        formData
      );

      await Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        text: `${formData.role} registration completed successfully.`,
        confirmButtonColor: "#e63946",   
      });

      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);

      Swal.fire({
        icon: "error",
        title: "Registration Failed ❌",
        text: error.response?.data?.message
          ? error.response.data.message
          : `Unable to register ${formData.role}. Please try again.`,
        confirmButtonColor: "#e63946",   
      });
    }
  };

  return (
    <div className="user-register-container">
      <div className="user-form-container">
        <h1>
          Create Your <span className="red">SheWorks</span> Profile
        </h1>
        <p>
          Already registered?{" "}
          <span className="login-link">
            <Link to="/login">Login</Link>
          </span>
        </p>

        {/* 💥 Disable browser’s default validation */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              type="number"
              name="phone"
              placeholder="Phone No"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="input-group">
            <input
              type="text"
              name="address"
              placeholder="Address / City"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="user-register-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;
