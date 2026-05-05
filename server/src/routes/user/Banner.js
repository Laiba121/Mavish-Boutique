import express from "express";
import { getActiveBanners } from "../../controller/bannerController.js";

const router = express.Router();

// PUBLIC HERO BANNERS
router.get("/", getActiveBanners);

export default router;