import express from "express";
import {
  getProducts,
  getSingleProduct
} from "../../controller/productController.js";

const router = express.Router();

// PUBLIC
router.get("/", getProducts);
router.get("/:slug", getSingleProduct);

export default router;