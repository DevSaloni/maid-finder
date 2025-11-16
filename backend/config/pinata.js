const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

require("dotenv").config();
console.log("Loaded API_KEY:", process.env.API_KEY);
console.log("Loaded API_SECR CvhjklET_KEY:", process.env.API_SECRET_KEY);

// Upload file to Pinata
const uploadFileToPinata = async (filepath) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filepath));

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: process.env.API_KEY,
          pinata_secret_api_key: process.env.API_SECRET_KEY,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Pinata upload error:", err.response?.data || err.message);
    throw err;
  }
};

// Upload JSON object to Pinata
const uploadJsonToPinata = async (payload) => {
  if (!payload) throw new Error("No JSON object provided for Pinata upload");

  try {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const res = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: process.env.API_KEY,
        pinata_secret_api_key: process.env.API_SECRET_KEY,
        Accept: "application/json",
      },
    });

    return res.data;
  } catch (err) {
    console.error("Pinata JSON upload error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = { uploadFileToPinata, uploadJsonToPinata };
