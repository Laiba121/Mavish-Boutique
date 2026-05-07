// routes/contactRoutes.js

import express from "express";
import Contact from "../../model/Contact.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, phone, email, comment } = req.body;

    if (!email || !comment) {
      return res.status(400).json({
        message: "Email and Comment are required",
      });
    }

    await Contact.create({
      name,
      phone,
      email,
      comment,
    });

    res.status(201).json({
      message: "Your message has been submitted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;