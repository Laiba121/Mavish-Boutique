import cloudinary from "../utils/Cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const base64 = file.buffer.toString("base64");
      const dataUri = `data:${file.mimetype};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "products",
      });

      uploadedImages.push(result.secure_url);
    }

    return res.json({ images: uploadedImages });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};