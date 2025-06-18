const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config();

const app =  express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));


// Database connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('MongoDB Connected successully');
    
}).catch(error=>{
    console.error('MongoDB Connection Error: ',error);
    
})

// Routes
const authRoutes= require("./routes/auth")
app.use('/api', authRoutes)



// Server initialization
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT ${PORT}`);
    
})