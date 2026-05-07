import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,   // ✅ ADD THIS
} from "../../controller/categoryController.js";

import { protect, adminOnly } from "../../middleware/auth.js";

const router = express.Router();

// ✅ ADD THIS (VERY IMPORTANT)
router.get("/", getCategories);

// ADMIN
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;