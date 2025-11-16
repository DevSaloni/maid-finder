import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import { FaEnvelope, FaFacebook, FaTwitter, FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";

import "./Contact.css";
import {useApi} from "../context/ApiContext";

const Contact = () => {
  const {BASE_URL} = useApi();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/contact/save`, formData);

     Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Your message has been delivered successfully 💌",
        confirmButtonColor: "#e63946",   
      });

      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
     
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to send your message. Please try again later 😞",
         confirmButtonColor: "#e63946",   
      });

    }
  };

  return (
    <div className="contact-wrapper">
      <div className="contact-left">
        <h2>Get in Touch</h2>
        <p>I’d love to hear from you!</p>
        <p>If you have any inquiries or just want to say hi, please use the contact form!</p>

        <div className="contact-info">
          <FaEnvelope className="icon" />
          <a href="mailto:sheworks@gmail.com">sheworks@gmail.com</a>
        </div>

        <div className="social-icons">
          <FaFacebook />
          <FaTwitter />
          <FaLinkedin />
          <FaGithub />
          <FaInstagram />
        </div>
      </div>

      <div className="contact-right">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message" required></textarea>
          <button type="submit" className="send-message">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
