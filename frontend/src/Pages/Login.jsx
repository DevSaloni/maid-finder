import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import {useApi} from "../context/ApiContext";

import "./UserRegister.css";

const Login = () => {
  const {BASE_URL} = useApi();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/login`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("userToken", response.data.token);

      const userInfo = {
        name: response.data.fullName,
        email: response.data.email,
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      // ✅ SweetAlert success popup
      await Swal.fire({
        icon: "success",
        title: "Login Successful ✅",
        text: `Welcome back, ${response.data.fullName || "User"}!`,
        confirmButtonColor: "#e63946",   
      });

      console.log("User Data:", response.data);
      window.location.href = "/"; // redirect to home
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);

      // ❌ SweetAlert invalid credentials popup
      Swal.fire({
        icon: "error",
        title: "Login Failed ❌",
        text:
          err.response?.data?.message ||
          "Invalid email or password. Please try again.",
        confirmButtonColor: "#e63946",   
      });
    }
  };

  return (
    <div className="user-register-container">

      <div className="user-form-container">
        <h1>Login to SheWorks</h1>
        <p>
          Not registered?{" "}
          <span className="login-link">
            <Link to="/employ-register">Register</Link>
          </span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="user-register-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
