const mongoose = require("mongoose");

const maidSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Maid must be at least 18 years old"],
      max: [60, "Maid age cannot exceed 60 years"],
    },

    wallet: {
      type: String,
      required: [true, "Wallet address is required"],
      unique: true,
      match: [/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"],
    },

    experience: {
      type: String,
      maxlength: [100, "Experience description too long"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      maxlength: [100, "Location cannot exceed 100 characters"],
    },

    workType: {
      type: String,
      enum: ["Senior care", "Baby care", "Housekeeping", "Cooking"],
      required: [true, "Work type is required"],
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Hourly"], 
      required: [true, "Job type is required"],
    },

   profilePhoto: {
  type: String,
  validate: {
    validator: function (v) {
      // Allow IPFS hashes or valid file URLs
      return v.startsWith("Qm") || /\.(jpg|jpeg|png)$/i.test(v);
    },
    message: "Profile photo must be a JPG or PNG image",
  },
},

idProof: {
  type: String,
  validate: {
    validator: function (v) {
      // Allow IPFS hashes or valid file URLs
      return v.startsWith("Qm") || /\.(jpg|jpeg|png|pdf)$/i.test(v);
    },
    message: "ID proof must be a JPG, PNG, or PDF file",
  },
},

    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },

    salaryType: {
      type: String,
      enum: ["Hourly", "Monthly", "Weekly"],
      default: "Monthly",
    },

    salaryAmount: {
      type: Number,
      default: 0,
      min: [0, "Salary cannot be negative"],
      max: [100000, "Salary too high"],
    },

    ipfsHash: String, // JSON file hash (metadata)
    txHash: String, // Blockchain transaction Hash

    isVerified: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },

    status: {
      type: String,
      enum: ["free", "hired"],
      default: "free",
    },

    hiredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maid", maidSchema);
