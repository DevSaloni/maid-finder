const express = require("express");
const router = express.Router();
const { 
  uploadJobDetails, 
  savedJob, 
  employerMarked,
  maidConfirmed,
  getJobByMaidWallet,
  getJobByEmployerWallet,
  getMaidProfileWithJobs,
  getAllJobs,
  cancelJobById
  
} = require("../controllers/JobController");

// Upload job details to Pinata
router.post("/upload", uploadJobDetails);

// Save job after blockchain tx confirmed
router.post("/save", savedJob);

router.put("/:id/employ-mark", employerMarked);
router.put("/:id/maid-confirm", maidConfirmed);

//get jobs by their wallet
router.get("/maid/:wallet",getJobByMaidWallet);
router.get("/employer/:wallet", getJobByEmployerWallet);

router.get("/all", getAllJobs);

//view profile page
router.get("/profile/:wallet",getMaidProfileWithJobs);

//cancel job by id 
router.put("/cancel/:jobId", cancelJobById);


module.exports = router;
