const Product = require("../models/Product");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const getImageURL = (imagePath,req) =>{
  if(!imagePath){
    return null;
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${imagePath.replace(/\\/g, '/')}`;
}

exports.addProduct = async (req, res) => {
  const { name, price, description } = req.body;
  const imagePath = req.file ? req.file.path : null;

  if (!name || !price || !description || !imagePath) {
    if (imagePath) {
      fs.unlink(imagePath, (error) => {
        if (error) {
          console.error("Error deleting uploaded file: ", error);
        }
      });
    }
    return res.status(400).json({
      message: "Please provide name, description, price, and an image.",
    });
  }

  try {
    const product = new Product({
      name,
      price,
      description,
      image: imagePath,
      user: req.user.id,
    });
    const createdProduct = await product.save();

    const productWithImageURL = {
      ...createdProduct._doc, // Use _doc to get plain JavaScript object
      image: getImageUrl(createdProduct.image, req),
    }
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: productWithImageURL,
    });
  } catch (error) {
    console.error("Error while adding product:", error);
    if (imagePath) {
      fs.unlink(imagePath, (err) => {
        if (err)
          console.error("Error deleting uploaded file on DB error:", err);
      });
    }
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
    const productsWithImageURLs = products.map(product => ({
            ...product._doc,
            image: getImageURL(product.image, req)
        }));
    res.status(200).json({
      message: "Products fetched successfully",
      products: productsWithImageURLs,
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
      user: req.user.id,
    }).populate('user', 'username email');
    const productsWithImageURLs = products.map(product => ({
            ...product._doc,
            image: getImageURL(product.image, req)
        }));
    res.status(200).json({
      message: "My products fetched successfully",
      products: productsWithImageURLs,
    });
  } catch (error) {
    console.error("Error while fetching products:", error);
    res.status(500).json({
      message: "Internal server error.Could not fetch products.",
    });
  }
};

exports.getProductById = async (req, res) => {
  const {id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({ message: 'Invalid product ID.' });
  }
  try {
    const product = await Product.findById(id).populate(
      "user",
      "username email"
    );
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const productWithImageURL = {
            ...product._doc,
            image: getImageURL(product.image, req),
        };
    res.status(200).json({
      message: "Product fetched successfully",
      product: productWithImageURL,
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
  const { id } = req.params;
  const { name, price, description } = req.body;
  const newImagePath = req.file ? req.file.path : null;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    if (newImagePath) {
      fs.unlink(newImagePath, (error) => {
        if (error) {
          console.error(
            "Error while deleting new uploaded file for invalid ID: ",
            error
          );
        }
      });
    }
    return res.status(400).json({ message: "Invalid product ID." });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      if (newImagePath) {
        fs.unlink(newImagePath, (err) => {
          if (err)
            console.error(
              "Error while deleting new uploaded file for non-existent product:",
              err
            );
        });
      }
      return res.status(404).json({
        message: "Product not found",
      });
    }
    // Checking if the aurhorized user is updating the product
    if (product.user.toString() !== req.user.id.toString()) {
      if (newImagePath) {
        fs.unlink(newImagePath, (err) => {
          if (err)
            console.error(
              "Error deleting new uploaded file for unauthorized user:",
              err
            );
        });
      }
      return res.status(403).json({
        message: "Not authorized to update this product",
      });
    }

    // Update fields
    product.name = name || product.name;
    product.price = price != undefined ? price : product.price;
    product.description = description || product.description;

    // Handle image update
    if (newImagePath) {
      // Delete the old image file if it exists
      if (product.image) {
        fs.unlink(product.image, (error) => {
          if (error) {
            console.error("Error deleting old product image file: ", error);
          }
        });
      }
      product.image = newImagePath;
    } else if (req.body.image === "") {
      if (product.image) {
        fs.unlink(product.image, (error) => {
          if (error) {
            console.error("Error deleting product image on clear:", error);
          }
        });
      }
      product.image = "";
    }

    const updatedProduct = await product.save();
    const productWithImageURL = {
            ...updatedProduct._doc,
            image: getImageURL(updatedProduct.image, req),
        };
    res.status(200).json({
      message: "Product updated successfully",
      product: productWithImageURL,
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
    if (newImagePath) {
            fs.unlink(newImagePath, (err) => {
                if (err) console.error("Error deleting new uploaded file on DB error:", err);
            });
        }
    res
      .status(500)
      .json({ message: "Server error: Could not update product." });
  }
};

// delete product by id controller function
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    // Checking if the authorized user is deleting the product
    if (product.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "User is not authorized to delete the product",
      });
    }
    if (product.image) {
      fs.unlink(product.image, (error) => {
        if (error) {
          console.error("Error while deleting product image file: ", error);
        }
      });
    }
    await Product.deleteOne({
      _id: id,
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
