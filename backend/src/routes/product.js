const express = require("express");
const {
  addProduct,
  getMyProducts,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/productController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require('../config/multerConfig')
const router = express.Router();

// Public route
router.get("/", getProducts);

router.get("/my", protect, getMyProducts);
router.get("/:id", getProductById);

// Protected routes (basically it requires authentication)
router.post("/", protect, upload.single('image'), addProduct);

router.put("/:id", protect, upload.single('image'), updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
