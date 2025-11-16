const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: Number, required: true, unique: true }, 
    maidWallet: { type: String, required: true, index: true },
    maidName: { type: String },
    employerWallet: { type: String, required: true, index: true },
    employerEmail: String,
    employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  },
  maid: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Maid"
},

    ipfsHash: { type: String, required: true },
    txHash: { type: String, required: true, unique: true },
    amountEth: { type: String, default: "0" },  // ETH for display
    amountWei: { type: String, default: "0" },  // Wei for blockchain
    startDate: { type: Date },
    status: {
      type: String,
      enum: [ "Active", "Paid", "Cancelled"],
      default: "Active"
    },
    employerMarked: { type: Boolean, default: false },
    maidConfirmed: { type: Boolean, default: false },
    jobDesc: { type: String },
    jobType: { type: String, default: "Full Time" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
