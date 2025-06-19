const mongoose = require('mongoose');
const bcrypt= require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true, 
        minLength: 3
    },
    email: {
        type: String,
        required: [true,"Please add an email"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    }, 
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minLength: 8,
        

    },
    createdAt: {
        type: Date,
        default: Date.now

    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// save hashed passwords into the database so that even DB admin cannot be read user passwords
userSchema.pre('save', async function (next) {
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
});
// Method to compare the user-entered password with already exisiting hashed password 
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Method to generate a reset password token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex'); //Generate a random reset token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //Hash the token and save it to the user's document
    this.resetPasswordExpires = Date.now() + 3600000; //1 hour in milliseconds
    return resetToken; //Returns the unhashed token which is then to be sent in the mail
}



const User = mongoose.model('User', userSchema)
module.exports = User;