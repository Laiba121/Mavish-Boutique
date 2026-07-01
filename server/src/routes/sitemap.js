import express from "express";
import Product from "../model/Product.js"; // matches your existing import path/casing

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://www.mavishboutique.com";

    const collections = await Product.distinct("collection");
    const products = await Product.find({}, "slug");

    const staticUrls = [
      "/",
      "/login",
      "/register",
      "/about-us",
      "/terms-of-service",
      "/privacy-policy",
      "/payment",
      "/return-exchange",
      "/faqs",
      "/contact",
      "/sale",
      "/whats-new",
      "/boys",
      "/girls",
      "/men",
      "/women",
      "/admin/dashboard",
      "/admin/products",
      "/admin/categories",
      "/admin/orders",
      "/admin/customers",
      "/admin/banners",
      "/admin/contacts",
    ];

    let urls = staticUrls.map(
      (path) => `<url><loc>${baseUrl}${path}</loc></url>`
    );

    collections.forEach((name) => {
      if (name) {
        urls.push(
          `<url><loc>${baseUrl}/whats-new?collection=${encodeURIComponent(name)}</loc></url>`
        );
      }
    });

    products.forEach((p) => {
      if (p.slug) {
        urls.push(
          `<url><loc>${baseUrl}/product/${encodeURIComponent(p.slug)}</loc></url>`
        );
      }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

export default router;