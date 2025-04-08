const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

// Multer upload middleware
const upload = multer({ storage });

module.exports = upload;
