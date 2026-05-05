import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts
} from "../../controller/productController.js";

import { protect, adminOnly } from "../../middleware/auth.js";

const router = express.Router();

router.get("/", protect, adminOnly, getProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;