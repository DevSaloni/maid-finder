const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // same destination
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ File type restriction
const fileFilter = (req, file, cb) => {
  // Separate rules for profilePhoto and idProof
  const imageTypes = /jpeg|jpg|png/;
  const documentTypes = /jpeg|jpg|png|pdf/;

  if (file.fieldname === "profilePhoto") {
    // ✅ Only images allowed for profilePhoto
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Profile photo must be an image (jpg, jpeg, png only)."));
    }
  } 
  else if (file.fieldname === "idProof") {
    // ✅ Allow image or PDF for idProof
    const extname = documentTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = documentTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("ID proof must be an image or PDF (jpg, jpeg, png, pdf)."));
    }
  } 
  else {
    cb(new Error("Invalid file field name."));
  }
};

// ✅ File size limit (2 MB max)
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
});

module.exports = upload;
