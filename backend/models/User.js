const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    trim: true,                 // removes spaces before/after
    minlength: 3,               // minimum name length
    maxlength: 50,              // limit to avoid huge strings
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,            // converts automatically to lowercase
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // email pattern
  },
  phone: { 
    type: String, 
    required: true, 
    match: [/^[0-9]{10}$/, "Phone number must be 10 digits"], // only digits
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6,               // minimum password length
    maxlength: 100,             // security limit
  },
  address: { 
    type: String, 
    required: true, 
    trim: true, 
    minlength: 5, 
    maxlength: 200, 
  },
 
}, { timestamps: true });

// 🔒 Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
