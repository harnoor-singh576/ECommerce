const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req,res,next)=> {
    let token;
    
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1];
            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password'); //-password is used to exclude the password hash from the user object

            if(!req.user){
                return res.status(401).json({
                    message:'Not authorized, user not found'
                })
            }
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                message: 'Not authorized. Token failed.'
            })
        }
    }
    
    
    if(!token){
        return res.status(401).json({
            message: "Not authorized. No token"
        })
    }
}
module.exports = {protect}