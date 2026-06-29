import express from "express";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBannersAdmin,
} from "../../controller/bannerController.js";

import { protect, adminOnly } from "../../middleware/auth.js";
import { uploadBanner } from "../../utils/Upload.js"; // ✅ FIXED
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js"; // ✅ ADD

const router = express.Router();

// ================= BANNERS =================
router.get("/", protect, adminOnly, getAllBannersAdmin);
router.post("/", protect, adminOnly, createBanner);
router.put("/:id", protect, adminOnly, updateBanner);
router.delete("/:id", protect, adminOnly, deleteBanner);

// ================= IMAGE UPLOAD =================
router.post(
  "/upload",
  protect,
  adminOnly,
  uploadBanner, // ✅ FIXED (instead of upload.single)
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const url = await uploadToCloudinary(req.file, "banners");

      res.json({ image: url }); // ✅ return image
    } catch (err) {
      console.error("BANNER UPLOAD ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;