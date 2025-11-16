import React, { useState, useRef } from 'react';
import axios from "axios";
import getContract from '../../config/contract';
import Swal from "sweetalert2";
import "./RegisterMaid.css";
import {useApi} from "../context/ApiContext";

const RegisterMaid = () => {
  const {BASE_URL} = useApi();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    experience: "",
    location: "",
    workType: "",
    jobType: "",
    profilePhoto: null,
    idProof: null,
    bio: "",
    salaryType: "",
    salaryAmount: "",
    showIdProof: false,
  });

  const profilePhotoRef = useRef(null);
  const idProofRef = useRef(null);

  // ✅ Handle input change with file validation (type + size)
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      const maxSize = 2 * 1024 * 1024; // 2MB limit same as backend

     const imageTypes = ["image/jpeg", "image/jpg", "image/png"];
    const documentTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];


      // ✅ File type validation
    if(name === "profilePhoto"){
      if(!imageTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Only JPG, JPEG, PNG  files are allowed.",
        });
        e.target.value = "";
        return;
      }
    }

    if (name === "idProof") {
      if (!documentTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "ID proof must be an image or PDF (JPG, JPEG, PNG, PDF only).",
        });
        e.target.value = "";
        return;
      }
    }
      // ✅ File size validation
      if (file.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "File size must be less than 2MB.",
        });
        e.target.value = "";
        return;
      }

      // ✅ Update state if validation passes
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (name === "profilePhoto") {
        setFormData((prev) => ({ ...prev, showIdProof: true }));
      }
    } else {
      // ✅ For text fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ✅ Field validation for each step
  const validateStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim() || !formData.age) {
        Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: "Please enter your full name and age.",
        });
        return false;
      }
      if (formData.age < 18) {
        Swal.fire({
          icon: "error",
          title: "Invalid Age",
          text: "Age must be 18 or above.",
        });
        return false;
      }
    } else if (step === 2) {
      if (!formData.experience.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Missing Field",
          text: "Please enter your work experience.",
        });
        return false;
      }
      if (!formData.location.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Missing Field",
          text: "Please enter your location.",
        });
        return false;
      }
      if (!formData.workType) {
        Swal.fire({
          icon: "warning",
          title: "Missing Field",
          text: "Please select your work type.",
        });
        return false;
      }
      if (!formData.jobType) {
        Swal.fire({
          icon: "warning",
          title: "Missing Field",
          text: "Please select your job type.",
        });
        return false;
      }
      if (!formData.salaryType) {
        Swal.fire({
          icon: "warning",
          title: "Missing Field",
          text: "Please select your salary type.",
        });
        return false;
      }
      if (!formData.salaryAmount || formData.salaryAmount <= 0) {
        Swal.fire({
          icon: "error",
          title: "Invalid Salary",
          text: "Please enter a valid salary amount.",
        });
        return false;
      }
    } else if (step === 3) {
      if (!formData.profilePhoto) {
        Swal.fire({
          icon: "warning",
          title: "Missing Upload",
          text: "Please upload your profile photo.",
        });
        return false;
      }
      if (!formData.idProof) {
        Swal.fire({
          icon: "warning",
          title: "Missing Upload",
          text: "Please upload your ID proof.",
        });
        return false;
      }
      if (!formData.bio.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Missing Bio",
          text: "Please enter a short bio about yourself.",
        });
        return false;
      }
    }
    return true;
  };

  // ✅ Handle form submit
  const registerMaid = async () => {
    if (!validateStep()) return;

    try {
      const { contract, signer } = await getContract();
      if (!contract || !signer) return;

      const signerAddress = await signer.getAddress();
      const adminAddress = await contract.admin();

      if (signerAddress.toLowerCase() === adminAddress.toLowerCase()) {
        Swal.fire({
          icon: "warning",
          title: "Admin Account Detected",
          text: "Admin cannot register as Maid. Please switch account.",
        confirmButtonColor: "#e63946",   
        });
        return;
      }

      // ✅ Check if maid with this wallet already exists (backend check)
      const checkRes = await axios.get(`${BASE_URL}/api/maids/check/${signerAddress}`);
      if (checkRes.data.exists) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Entry",
          text: "This wallet is already registered as a Maid!",
        confirmButtonColor: "#e63946",   
        });
        return;
      }

      // 2️⃣ Upload files
      const form = new FormData();
      for (const key in formData) {
        if (formData[key] && key !== "showIdProof") {
          form.append(key, formData[key]);
        }
      }
      form.append("wallet", signerAddress);

      Swal.fire({
        title: "Uploading Files...",
        text: "Please wait while we upload your documents.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const uploadRes = await axios.post(
        `${BASE_URL}/api/maids/upload`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { profileHash, idProofHash } = uploadRes.data;
      if (!profileHash || !idProofHash) {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "File upload failed, please try again.",
        });
        return;
      }

      // 3️⃣ Blockchain register
      const tx = await contract.connect(signer).registerMaid(profileHash);
      const receipt = await tx.wait();

      Swal.close();

      // 4️⃣ Save maid in DB
      const dbRes = await axios.post(`${BASE_URL}/api/maids/save`, {
        ...formData,
        age: Number(formData.age),
        salaryAmount: Number(formData.salaryAmount),
        wallet: signerAddress,
        profilePhoto: profileHash,
        idProof: idProofHash,
        ipfsHash: profileHash,
        txHash: receipt.transactionHash,
      });
    

      if (dbRes.data?.maid) {
        Swal.fire({
          icon: "success",
          title: "Registration Successful 🎉",
          text: "You have been registered successfully as a Maid!",
        confirmButtonColor: "#e63946",   
        });

        // ✅ Reset form
        setStep(1);
        setFormData({
          fullName: "",
          age: "",
          experience: "",
          location: "",
          workType: "",
          jobType: "",
          profilePhoto: null,
          idProof: null,
          bio: "",
          salaryType: "",
          salaryAmount: "",
          showIdProof: false,
        });
        if (profilePhotoRef.current) profilePhotoRef.current.value = "";
        if (idProofRef.current) idProofRef.current.value = "";
      }

    } catch (err) {
      console.error("Error registering maid:", err);

      // ✅ Clean, short popup message
      let errorMessage = "Something went wrong.";

      if (err.reason) {
        errorMessage = err.reason;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        if (err.message.includes("already registered")) {
          errorMessage = "Maid already registered.";
        } else if (err.message.includes("user denied transaction")) {
          errorMessage = "Transaction cancelled by user.";
        } else if (err.message.includes("404")) {
          errorMessage = "Server not found. Please check your backend route.";
        } else {
          errorMessage = err.message.split("(")[0];
        }
      }

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMessage,
        confirmButtonColor: "#e63946",   
      });
    }
  };


  return (
    <div className='maid-register'>
      

      <div className='maid-register-container'>
        {step === 1 && (
          <div className='maid-form'>
            <h3>Basic Info</h3>
            <input type='text' name="fullName" value={formData.fullName} onChange={handleChange} placeholder='Full Name' />
            <input type='number' name="age" value={formData.age} onChange={handleChange} placeholder='Age' />
            <button onClick={() => validateStep() && setStep(2)}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div className='maid-form'>
            <h3>Work Info</h3>
            <input type='text' name="experience" value={formData.experience} onChange={handleChange} placeholder='Experience (in years)' />
            <input type='number' name="salaryAmount" value={formData.salaryAmount} onChange={handleChange} placeholder='Required Salary' />
            <input type='text' name="location" value={formData.location} onChange={handleChange} placeholder='Location' />
            <select name="workType" value={formData.workType} onChange={handleChange}>
              <option value="">Select Work Type</option>
              <option>Senior care</option>
              <option>Baby care</option>
              <option>Housekeeping</option>
              <option>Cooking</option>
            </select>
            <select name='jobType' value={formData.jobType} onChange={handleChange}>
              <option value="">Select Job Type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Hourly</option>
            </select>
            <select name='salaryType' value={formData.salaryType} onChange={handleChange}>
              <option value="">Select Salary Type</option>
              <option>Hourly</option>
              <option>Monthly</option>
              <option>Weekly</option>
            </select>

            <div className="btn-groups">
              <button onClick={() => setStep(1)}>Previous</button>
              <button onClick={() => validateStep() && setStep(3)}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='maid-form'>
            <h3>Upload & Verification</h3>
            <label>Profile Photo:</label>
            <input type='file' name="profilePhoto" onChange={handleChange} ref={profilePhotoRef} />

            {formData.showIdProof && (
              <>
                <label>ID Proof:</label>
                <input type='file' name="idProof" onChange={handleChange} ref={idProofRef} />
              </>
            )}

            <textarea placeholder='Short Bio' name="bio" value={formData.bio} onChange={handleChange}></textarea>

            <div className="btn-group">
              <button onClick={() => setStep(2)}>Previous</button>
              <button className="register-btn" onClick={registerMaid}>Register</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterMaid;
