import Product from "../model/Product.js";

//
// ─── GET PRODUCTS (PUBLIC / ADMIN BOTH) ─────────────
//
export const getProducts = async (req, res) => {
  try {
    const { category, trending, newArrival, sale, collection, limit } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (trending === "true") filter.isTrending = true;
    if (newArrival === "true") filter.isNewArrival = true;
    if (sale === "true") filter.isSale = true;
    if (collection) filter.productCollection = collection;

    let query = Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });

    if (limit) query = query.limit(parseInt(limit));

    const products = await query;

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
// ─── GET SINGLE PRODUCT ────────────────────────────
//
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
// ─── CREATE PRODUCT ────────────────────────────────
//
export const createProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.sku) delete data.sku;

    const product = await Product.create(data);

    res.status(201).json(product);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};

//
// ─── UPDATE PRODUCT (FIXED 🔥) ─────────────────────
//
export const updateProduct = async (req, res) => {
  try {
    let data = { ...req.body };

    // ❌ remove invalid fields
    delete data.slug;
    if (!data.sku) delete data.sku;

    // ✅ remove empty fields (VERY IMPORTANT)
    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === undefined) {
        delete data[key];
      }
    });

    // ✅ ensure images are valid URLs only
    if (Array.isArray(data.images)) {
      data.images = data.images.filter(
        (img) => typeof img === "string" && img.startsWith("http")
      );
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};

//
// ─── DELETE PRODUCT ────────────────────────────────
//
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};