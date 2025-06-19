const Product = require("../models/Product");

exports.addProduct = async (req, res) => {
  const { name, price, description, image } = req.body;
  if (!name || !price || !description) {
    return res.status(400).json({
      message: "Please enter all the required product fields",
    });
  }

  try {
    const product = new Product({
      name,
      price,
      description,
      image,
      user: req.user._id,
    });
    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: createdProduct,
    });
  } catch (error) {
    console.error("Error while adding product:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error: Could not add product." });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("user", "username email");
    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
    res.status(500).json({
      message: "Server error: Could not fetch products",
    });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      user: req.user._id,
    });
    res.status(200).json({
      message: "My products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error while fetching products:", error);
    res.status(500).json({
      message: "Internal server error.Could not fetch products.",
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "user",
      "username email"
    );
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product by its ID:");
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID." });
    }
    res.status(500).json({ message: "Server error: Could not fetch product." });
  }
};
//  Update product by id controller function
exports.updateProduct = async (req, res) => {
  const { name, price, description, image } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    // Checking if the aurhorized user is updating the product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this product",
      });
    }

    // Update fields
    product.name = name || product.name;
    product.price = price != undefined ? price : product.price;
    product.description = description || product.description;
    product.image = image || product.image;

    const updatedProduct = await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product: ", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID." });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res
      .status(500)
      .json({ message: "Server error: Could not update product." });
  }
};

// delete product by id controller function
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    // Checking if the authorized user is deleting the product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "User is not authorized to delete the product",
      });
    }
    await Product.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Error while deleting product: ", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID." });
    }
    res
      .status(500)
      .json({ message: "Server error: Could not delete product." });
  }
};
