const express = require('express');
const { addProduct, getMyProducts, getProducts } = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Route to get all products
router.get('/', getProducts);

// Protected routes
router.post('/', protect, addProduct);
router.post('/my', protect, getMyProducts)

module.exports = router;