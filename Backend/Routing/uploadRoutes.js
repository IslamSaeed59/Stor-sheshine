const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/* ==============================
   📦 Multer (Disk Storage)
============================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const parser = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ==============================
   🖼 Upload Variant Image
============================== */

router.post(
  "/imageVariant",
  parser.single("imageVariant"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Please upload a file." });

      const imageUrl = `/uploads/${req.file.filename}`;

      res.status(200).json({
        message: "Variant image uploaded successfully",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("❌ Variant Upload error:", error);
      res.status(500).json({ message: error.message });
    }
  },
);

/* ==============================
   📂 Upload sizeChart image
============================== */

router.post("/sizeChart", parser.single("sizeChart"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload a file." });

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "SizeChart image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("❌ SizeChart Upload error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ==============================
   📂 Upload Category Image
============================== */

router.post("/categories", parser.single("categoryImage"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload a file." });

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "Category image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("❌ Category Upload error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ==============================
   📦 Upload Product Image
============================== */

router.post("/", parser.single("productImage"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload a file." });

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "Product image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("❌ Product Upload error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ==============================
   📸 Upload MainPage Image
============================== */

router.post("/mainpage", parser.single("mainPageImage"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload a file." });

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "MainPage image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("❌ MainPage Upload error:", error);
    res.status(500).json({ message: error.message });
  }
});

/* ==============================
   ⚠️ Error Handler
============================== */

router.use((err, req, res, next) => {
  console.error("❌ Multer Error:", err);
  res.status(400).json({ message: err.message });
});

module.exports = router;
