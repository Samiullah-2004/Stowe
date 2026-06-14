const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    image: {
        type: Buffer,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0 
    },
    stock: {
        type: Number,
        default: 0
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String
}, { timestamps: true });

module.exports = mongoose.model("product", productSchema);