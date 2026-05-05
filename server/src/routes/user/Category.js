import express from "express";
import { getCategories } from "../../controller/categoryController.js";

const router = express.Router();

// GET /api/categories
router.get("/", getCategories);

export default router;