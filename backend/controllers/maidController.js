
const Maid = require("../models/Maid");
const User= require("../models/User");

const maidContract = require("../config/contract");
const { uploadFileToPinata } = require("../config/pinata");

// 1️⃣ Upload files (Pinata)
const uploadMaidFiles = async (req, res) => {
  try {
    const profileFile = req.files?.profilePhoto?.[0];
    const idProofFile = req.files?.idProof?.[0];

    if (!profileFile || !idProofFile) {
      return res.status(400).json({ message: "Profile photo and idProof are required" });
    }

    const profileUpload = await uploadFileToPinata(profileFile.path);
    const idProofUpload = await uploadFileToPinata(idProofFile.path);

    res.status(200).json({
      profileHash: profileUpload.IpfsHash,
      idProofHash: idProofUpload.IpfsHash,
    });
  } catch (err) {
    console.error("Error uploading maid files:", err.message);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// 2️⃣ Save maid in DB (after blockchain success)
const saveMaid = async (req, res) => {
  try {
    const { fullName, age, wallet, experience, location, workType, jobType, bio,salaryType,salaryAmount,profilePhoto, idProof, ipfsHash, txHash,status,hiredBy } = req.body;

    const maid = new Maid({
      fullName,
      age: Number(age),
      wallet,
      experience,
      location,
      workType,
      jobType,
      bio,
      salaryType,
      salaryAmount:Number(salaryAmount),
      profilePhoto,
      idProof,
      ipfsHash,
      isVerified: "Pending" ,
      txHash,
      status:"free",
      hiredBy,
    });

    await maid.save();
    res.status(201).json({ message: "Maid saved successfully", maid });
  } catch (err) {
    console.error("Error saving maid:", err.message);
    res.status(500).json({ message: "DB save error", error: err.message });
  }
};


//get all  maid 
const getAllMaid = async(req,res) =>{
  try{
  const maid = await Maid.find();

  if(!maid)   return res.status(404).json({message:"Maid not found"}); 
  return res.json(maid);
  }catch(err){
    res.status(500).json({ message: "server error", error: err.message });
  }
}

//get maid data from backend 
//based on their wallet 
const getMaid = async(req,res)=>{
try{
const maid = await Maid.findOne({wallet:req.params.wallet})
.populate("hiredBy", "fullName email phone address") //get hire maid info

if(!maid){
  return res.status(404).json({message:"Maid not found"});
}
res.json(maid);
}catch(err){
    res.status(500).json({ message: "server error", error: err.message });
}
}

// get maid by id 
const getMaidById  = async(req,res)=>{
  try{
   const maid = await Maid.findById(req.params.id);
   if(!maid){
      return res.status(404).json({message:"Maid not found"});
   }
   res.json(maid);
  }catch(err){
        res.status(500).json({ message: "server error", error: err.message });
  }
}

//update the maid status 
const updateStatus = async(req,res)=>{
  try{
    const {wallet,isVerified} = req.body;
    const maid = await Maid.findOneAndUpdate(
      {wallet},
      {isVerified},
      {new:true}
    )
  if(!maid){
      return res.status(404).json({message:"Maid not found"});
  }
  res.json({ message: "Status updated successfully", maid }); // ✅ send response

  }catch(err){
    res.status(500).json({ message: "server error", error: err.message });

  }
}

// hire maid status update
// ✅ Hire maid and populate employer info
const hireMaid = async (req, res) => {
  try {
    const { maidId, email } = req.body; // email comes from frontend (localStorage)

    // 🧾 1. Find employer
    const employer = await User.findOne({ email });
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    // 🧾 2. Find maid
    const maid = await Maid.findById(maidId);
    if (!maid) return res.status(404).json({ message: "Maid not found" });

    // 🧾 3. Check already hired
    if (maid.status === "hired") {
      return res.status(400).json({ message: "Maid is already hired" });
    }

    // 🧾 4. Update maid details
    maid.status = "hired";
    maid.hiredBy = employer._id;
    await maid.save();

    // 🧾 5. Re-fetch maid with populated employer info
    const updatedMaid = await Maid.findById(maidId).populate(
      "hiredBy",
      "fullName email phone address role"
    );

    return res.status(200).json({
      message: "Maid hired successfully",
      maid: updatedMaid,
    });
  } catch (err) {
    console.error("Error hiring maid:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// // ✅ Check if maid already exists by wallet

const getMaidFromWallet = async(req,res) =>{
try {
    const existingMaid = await Maid.findOne({ wallet: req.params.wallet });

    if (existingMaid) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking maid:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
  


module.exports = { uploadMaidFiles, saveMaid,getAllMaid,getMaid,getMaidById,updateStatus,hireMaid,getMaidFromWallet};
