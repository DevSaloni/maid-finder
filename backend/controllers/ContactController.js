const Contact = require("../models/Contact");

// ✅ Save contact message
 const saveContact = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newContact = new Contact({ firstName, lastName, email, message });
    await newContact.save();

    res.status(201).json({ message: "Message sent successfully!", contact: newContact });
  } catch (err) {
    console.error("Error saving contact:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports ={saveContact};
