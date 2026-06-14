const mongoose = require('mongoose');
const joi = require('joi');

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'product',
        }
    ],
    
    contact: String,
    profilepic: {
    type: String,
    default: ""
}
});

const validateRegisterUser = (data) => {
    const schema = joi.object({
        fullname: joi.string().min(3).max(30).required().messages({
            'string.empty': 'Full name cannot be empty',
            'string.min': 'Full name must be at least 3 characters long'
        }),
        email: joi.string().email().required().messages({
            'string.email': 'Please enter a valid email address'
        }),
        password: joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long'
        })
    });

    return schema.validate(data, { abortEarly: false });
};

const validateLoginUser = (data) => {
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'string.email': 'Please enter a valid email address'
        }),
        password: joi.string().required()
    });

    return schema.validate(data, { abortEarly: false });
};

module.exports = {
    userModel: mongoose.model("user", userSchema),
    validateRegisterUser,
    validateLoginUser
};