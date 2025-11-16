const express = require("express");
const router = express.Router();
const {saveContact} = require("../controllers/ContactController");


router.post("/save", saveContact);

module.exports = router;
