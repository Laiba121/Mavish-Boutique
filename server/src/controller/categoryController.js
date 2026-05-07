import Category from "../model/Category.js";

//
// ─── USER: GET CATEGORIES ────────────────────────────
//
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
// ─── ADMIN: CREATE CATEGORY ───────────────────────────
//
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//
// ─── ADMIN: UPDATE CATEGORY ───────────────────────────
//
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!category) return res.status(404).json({ message: "Not found" });

    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//
// ─── ADMIN: DELETE CATEGORY ───────────────────────────
//
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};