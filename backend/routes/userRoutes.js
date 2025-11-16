const express = require("express");
const router = express.Router();
const { registerUser, authUser,checkUserRegister } = require("../controllers/userContoller");

// 🔹 Register User
router.post("/register", registerUser);

// 🔹 Login User
router.post("/login", authUser);

//check user register
router.get("/check/register", checkUserRegister);

module.exports = router;
