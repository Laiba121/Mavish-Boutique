import express from "express";
import { upload } from "../../utils/upload.js";
import { uploadImage } from "../../controller/uploadController.js";
import { protect, adminOnly } from "../../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  uploadImage
);

export default router;