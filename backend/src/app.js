const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config();

const app =  express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: "GET,POST,PUT,DELETE", 
    credentials: true
}
app.use(cors(corsOptions));


// Database connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('MongoDB Connected successully');
    
}).catch(error=>{
    console.error('MongoDB Connection Error: ',error);
    
})

// Routes
const authRoutes= require("./routes/auth");
const productRoutes = require("./routes/product")

app.use('/api', authRoutes)
app.use('/api/products', productRoutes)

// API for testing
app.get('/', (req,res)=>{
    res.send("API is running....")
})



// Server initialization
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
    
})
module.exports = app;