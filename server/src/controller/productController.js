import Product from "../model/Product.js";

//
// ─── GET PRODUCTS ─────────────────────────────
//
export const getProducts = async (req, res) => {
  try {
    const query = {};

    // ✅ FILTER BY CATEGORY ID
    if (req.query.category) {
      query.category = req.query.category;
    }

    // ✅ SEARCH by name (case-insensitive, partial match)
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    // ✅ FILTER NEW ARRIVALS
    if (req.query.newArrival === "true") {
      query.isNewArrival = true;
    }

    // ✅ FILTER SALE ITEMS
    if (req.query.sale === "true") {
      query.isSale = true;
    }

   // ✅ ADD THIS: COLLECTION FILTER
    if (req.query.collection) {
      query.productCollection = req.query.collection;
    }

    // ✅ ONLY ACTIVE PRODUCTS
    query.status = "active";

    // ✅ LIMIT
    const limit = Number(req.query.limit) || 0;

    const products = await Product.find(query)
      .populate("category", "_id name")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//
// ─── GET SINGLE PRODUCT ───────────────────────
//
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    }).populate("category", "_id name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
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
// ─── UPDATE PRODUCT ─────────────────────────────────
//
export const updateProduct = async (req, res) => {
  try {
    let data = { ...req.body };

    delete data.slug;
    if (!data.sku) delete data.sku;

    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === undefined) {
        delete data[key];
      }
    });

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