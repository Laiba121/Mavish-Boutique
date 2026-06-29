import express from "express";
import { uploadCategory } from "../../utils/Upload.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { protect, adminOnly } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adminOnly, uploadCategory, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const url = await uploadToCloudinary(req.file, "categories");

    res.json({ image: url });
  } catch (err) {
    console.error("CATEGORY UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;