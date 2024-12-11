const { default: mongoose } = require("mongoose");
const Section = require("../models/Section");
const Stock = require("../models/Stock");
const Product = require("../models/Product");

// Add ExistingItem
exports.addProduct = async (req, res, next) => {
  try {
    const { stocks } = req.body;
    const section = await Section.findById(req.params.sectionId);
    if (!section) {
      throw new Error("Section not found.");
    }

    if (stocks && Array.isArray(stocks)) {
      for (const stock of stocks) {
        const { _id, qty } = stock;

        const stockDoc = section.stocks.find(
          (v) => v._id.toString() === _id.toString()
        );
        if (!stockDoc) {
          throw new Error(`Stock with ID ${_id} not found.`);
        }

        if (stockDoc.qty < qty) {
          throw new Error(
            `Insufficient stock Available: ${stockDoc.qty} in section, Requested: ${qty}`
          );
        }
        stockDoc.qty -= qty;
      }
    }
    const product = new Product(req.body);
    await section.save();
    await product.save();
    res.status(201).json({
      message: "product added successfully",
      product,
    });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new Error("Product not found");
    }
    const section = await Section.findById(req.params.sectionId);
    if (!section) {
      throw new Error("Section not found");
    }

    const { stocks } = req.body;
    if (stocks && Array.isArray(stocks)) {
      for (const stock of stocks) {
        const { _id, qty } = stock;

        const stockDoc = section.stocks.find(
          (v) => v._id.toString() === _id.toString()
        );
        const oldStock = product.stocks.find(
          (v) => v._id.toString() === _id.toString()
        );
        if (!stockDoc) {
          throw new Error(`Stock with ID ${_id} not found in this section.`);
        }

        stockDoc.qty += oldStock.qty;
        if (stockDoc.qty < qty) {
          throw new Error(
            `Insufficient stock available: ${stockDoc.qty}, Requested: ${qty}`
          );
        }
        stockDoc.qty -= qty;
      }
    }

    await section.save();
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      section: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating section:", error.message);
    next(error);
  }
};

// Delete ExistingItem
exports.deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    const updatedSection = await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: "Product deleted successfully",
      section: updatedSection,
    });
  } catch (error) {
    console.error("Error deleting Section:", error.message);
    next(error);
  }
};

// Get all Sections
exports.getAllProduct = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      message: "Product fetched successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get Product by ID with stock details and total price
exports.getProductById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id });

    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      message: "Product details fetched successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};
