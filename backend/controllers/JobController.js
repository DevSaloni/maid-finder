const Job = require("../models/Job");
const Maid = require("../models/Maid");
const User = require("../models/User");
const {maidContract} = require("../config/contract");

const { uploadJsonToPinata } = require("../config/pinata");

// 1) Upload job details to Pinata and generate jobId
const uploadJobDetails = async (req, res) => {
  try {
    const { maidWallet, employerWallet, jobDesc, startDate, amountEth, amountWei } = req.body;

    console.log(req.body);
    // ✅ Validate required fields
    if (!maidWallet || !employerWallet || !jobDesc) {
      return res.status(400).json({ message: "maidWallet, employerWallet, jobDesc are required" });
    }

    // ✅ Generate auto-increment jobId
   const lastJob = await Job.findOne().sort({ jobId: -1 });
const newJobId = lastJob && lastJob.jobId ? lastJob.jobId + 1 : 1;

console.log(lastJob);
console.log(newJobId);

    // ✅ Prepare payload for Pinata
    const payload = {
      jobId: newJobId,
      maidWallet,
      employerWallet,
      jobDesc,
      startDate: startDate || "",
      amountEth: amountEth || "0",
      amountWei: amountWei || "0",
      createdAt: new Date().toISOString()
    };

    // 🔹 Upload safely to Pinata
    let pinRes;
    try {
      pinRes = await uploadJsonToPinata(payload);
    } catch (err) {
      console.error("Pinata upload failed:", err.message);
      return res.status(500).json({ message: "Pinata Upload Fail", error: err.message });
    }

    if (!pinRes || !pinRes.IpfsHash) {
      return res.status(500).json({ message: "Invalid Pinata response" });
    }

    // ✅ Return jobId and IPFS hash to frontend
    return res.status(201).json({ ipfsHash: pinRes.IpfsHash, jobId: newJobId });

  } catch (err) {
    console.error("Server Error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 2) Save job after on-chain transaction confirmed
const savedJob = async (req, res) => {
  try {
    const {
      jobId,
      maidWallet,
      employerWallet,
      employerEmail,
      jobDesc,
      ipfsHash,
      txHash,
      amountEth,
      amountWei,
      startDate
    } = req.body;

    if (!jobId || !maidWallet || !employerWallet)
      return res.status(400).json({ message: "Missing required fields" });

    const employer = await User.findOne({
      email: { $regex: new RegExp(`^${employerEmail}$`, "i") }
    });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    const maid = await Maid.findOne({
      wallet: { $regex: new RegExp(`^${maidWallet}$`, "i") }
    });
    if (!maid) return res.status(404).json({ message: "Maid not found" });

    const normalizedMaidWallet = maidWallet.toLowerCase();
    let normalizedEmployerWallet = employerWallet.toLowerCase();

    // ✅ Get job from blockchain to confirm
    const contract = maidContract;
    const onChainJob = await contract.jobs(jobId);
    const blockchainEmployerWallet = onChainJob.employer.toLowerCase();

    if (blockchainEmployerWallet !== normalizedEmployerWallet) {
      return res.status(400).json({
        message: "Wallet mismatch between backend & blockchain",
        blockchainWallet: blockchainEmployerWallet,
        frontendWallet: normalizedEmployerWallet,
      });
    }

    // ✅ Save in MongoDB
    const newJob = new Job({
      jobId,
      maidWallet: normalizedMaidWallet,
      maid: maid._id,
      employerWallet: normalizedEmployerWallet,
      employerEmail,
      employer: employer._id,
      jobDesc,
      ipfsHash,
      txHash,
      amountEth,
      amountWei,
      startDate
    });

    await newJob.save();

    maid.status = "hired";
    maid.hiredBy = employer._id;
    await maid.save();

    const populatedJob = await Job.findById(newJob._id)
      .populate("employer", "fullName email phone address role")
      .populate("maid", "fullName")
      .lean();

    return res.status(201).json({
      message: "✅ Job saved successfully & maid hired",
      job: populatedJob,
    });
  } catch (error) {
    console.error("⚠️ Error saving job:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// 3) Employer marks job done
const employerMarked = async (req, res) => {
  try {
    const jobMongoId = req.params.id; // use Mongo _id here

    const job = await Job.findByIdAndUpdate(
      jobMongoId,
      { employerMarked: true, status: "Active" },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.json({ message: "Job marked by employer", job });
  } catch (err) {
    console.error("Employer mark error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 4) Maid confirms job
const maidConfirmed = async (req, res) => {
  try {
    const jobMongoId = req.params.id; // use Mongo _id here

    const job = await Job.findByIdAndUpdate(
      jobMongoId,
      { maidConfirmed: true, status: "Paid" },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found" });
   
    // ✅ Free maid after job completion
    const maid = await Maid.findOne({ wallet: job.maidWallet });
    if (maid) {
      maid.status = "free";
      await maid.save();
    }
    return res.json({ message: "Job confirmed by maid", job });
  } catch (err) {
    console.error("Maid confirm error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}; 


//get jobs by maid wallet
const getJobByMaidWallet = async (req, res) => {
  try {
    const wallet = req.params.wallet;

    // Fetch jobs and populate maid & employer info
    const jobs = await Job.find({
      maidWallet: { $regex: new RegExp(`^${wallet}$`, "i") }
    })
    .populate("maid", "fullName")         // maid fullName
    .populate("employer", "fullName email") // optional: employer info
    .lean();

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found for this maid" });
    }

    // Format jobs to include maidName and startDate
    const formattedJobs = jobs.map(job => ({
      ...job,
      maidName: job.maid?.fullName || "N/A",
      employerName: job.employer?.fullName || "N/A",
      startDate: job.startDate || null
    }));

    return res.json({ jobs: formattedJobs });

  } catch (err) {
    console.error("Error fetching maid jobs:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// get employer by wallet
// ✅ Get jobs by employer wallet with maid full name populated
const getJobByEmployerWallet = async (req, res) => {
  try {
    const wallet = req.params.wallet;

    // 🔹 Find jobs of that employer and populate maid full name
    const jobs = await Job.find({
      employerWallet: { $regex: new RegExp(`^${wallet}$`, "i") }
    })
      .populate("maid", "fullName") // ✅ Only bring maid's fullName
      .lean();

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found for this employer" });
    }

    // 🔹 Make sure maidName is included in response
    const formattedJobs = jobs.map(job => ({
      ...job,
      maidName: job.maid?.fullName || "N/A",
    }));

    return res.json({ jobs: formattedJobs });
  } catch (err) {
    console.error("⚠️ Error fetching employer jobs:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// 5) Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    return res.json(jobs);
  } catch (err) {
    console.error("Get all jobs error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


//get maid profile with jobs  from there wallet

// ✅ Get maid profile and job history (case-insensitive)
const getMaidProfileWithJobs = async (req, res) => {
  try {
    const wallet = req.params.wallet;

    // 🧾 Find maid and populate employer info
    const maid = await Maid.findOne({
      wallet: { $regex: new RegExp(`^${wallet}$`, "i") }
    }).populate("hiredBy", "fullName email phone address role");

    if (!maid) {
      return res.status(404).json({ message: "Maid not found" });
    }

    // 🧾 Get all jobs for this maid
    const jobs = await Job.find({
      maidWallet: { $regex: new RegExp(`^${wallet}$`, "i") }
    });

    return res.json({ maid, jobs });
  } catch (err) {
    console.error("⚠️ Error fetching maid profile:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


//cancel job by id 
const cancelJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOneAndUpdate(
      { jobId: Number(jobId) }, 
      { status: "Cancelled" },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
   
    //set maid back to free
    const maid = await Maid.findOne({
      wallet: { $regex: new RegExp(`^${job.maidWallet}$`, "i") }
    });    
    if (maid) {
      maid.status = "free";
      await maid.save();
    }

    res.status(200).json({
      message: "Job cancelled successfully",
      job,
    });
  } catch (err) {
    console.error("⚠️ Error cancelling job:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  uploadJobDetails,
  savedJob,
  employerMarked,
  maidConfirmed,
  getJobByMaidWallet,
  getJobByEmployerWallet,
  getMaidProfileWithJobs,
  getAllJobs,
  cancelJobById,
};
