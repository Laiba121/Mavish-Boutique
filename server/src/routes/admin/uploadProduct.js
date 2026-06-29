import express from "express";
import { uploadProduct } from "../../utils/Upload.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { protect, adminOnly } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adminOnly, uploadProduct, async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const images = [];

    for (const file of req.files) {
      const url = await uploadToCloudinary(file, "products");
      images.push(url);
    }

    res.json({ images });
  } catch (err) {
    console.error("PRODUCT UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;