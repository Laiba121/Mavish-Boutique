import cloudinary from "./Cloudinary.js";

export const uploadToCloudinary = async (file, folder) => {
  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
  });

  return result.secure_url;
};