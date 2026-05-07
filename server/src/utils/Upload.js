import multer from "multer";

const storage = multer.memoryStorage();

// ✅ PRODUCT (multiple images)
export const uploadProduct = multer({
  storage,
}).array("images", 5);

// ✅ CATEGORY (single image)
export const uploadCategory = multer({
  storage,
}).single("image");

// ✅ BANNER (single image)
export const uploadBanner = multer({
  storage,
}).single("image");