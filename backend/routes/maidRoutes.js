const express = require("express");
const {
  uploadMaidFiles,
  saveMaid,
  getMaid,
  getMaidById,
  updateStatus,
  getAllMaid,
  hireMaid,
  getMaidFromWallet
} = require("../controllers/maidController");
const upload = require("../middlewares/upload"); // multer config

const router = express.Router();

// File upload → Pinata
router.post(
  "/upload",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  uploadMaidFiles
);

// Save maid (after blockchain success)
router.post("/save", saveMaid);

// ✅ get all maid FIRST
router.get("/all", getAllMaid);

// get maid by wallet
router.get("/maid/:wallet", getMaid);

// get maid by id
router.get("/:id", getMaidById);

router.get("/check/:wallet",getMaidFromWallet)
// update status
router.post("/updateStatus", updateStatus);


// hire maid route
router.post("/hire", hireMaid);

module.exports = router;
