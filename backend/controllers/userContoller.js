const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 🔑 Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { fullName, email, phone, password, address } = req.body;

  if (!fullName || !email || !phone || !password || !address) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    address,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Authenticate user (login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// check user are register
const checkUserRegister = async (req, res) => {
  try {
    const { email } = req.query; // 👈 get email from query params
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ exists: false, message: "User not registered" });
    } else {
      return res.status(200).json({ exists: true, message: "User registered" });
    }
  } catch (err) {
    console.error("Error checking user:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = { registerUser, authUser ,checkUserRegister};
