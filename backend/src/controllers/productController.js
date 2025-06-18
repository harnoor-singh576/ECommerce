const Product = require('../models/Product')

exports.addProduct = async (req,res) => {
    const{name, price, description, image} = req.body;
    if(!name || !price || !description){
        return res.status(400).json({
            message: 'Please enter all the required product fields'
        })
    }

    try{
        const product = new Product({
            name,
            price,
            description,
            image, 
            user: req.user._id
        });
        const createdProduct = await product.save();
        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: createdProduct
        })
    }
    catch(error){
        console.error("Error while adding product:", error);
        if(error.name === "ValidationError"){
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error: Could not add product.' });
        

    }
}

exports.getProducts = async (req,res) => {
    try {
        const products = await Product.find().populate('user', 'username email')
        res.status(200).json({
            message: 'Products fetched successfully',
            products
        })
    } catch (error) {
        console.error('Error fetching products: ', error);
        res.status(500).json({
            message: "Server error: Could not fetch products"
        })
        
    }
}

exports.getMyProducts = async (req,res) => {
    try {
        const products = await Product.find({
            user: req.user._id
        });
        res.status(200).json({
            message: 'My products fetched successfully',
            products
        })
    } catch (error) {
        console.error("Error while fetching products:", error);
        res.status(500).json({
            message: "Internal server error.Could not fetch products."
        })
    }
}