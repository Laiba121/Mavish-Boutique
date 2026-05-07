import Banner from "../model/Banner.js";

// PUBLIC (HERO)
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN
export const getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!banner) return res.status(404).json({ message: "Not found" });

    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
