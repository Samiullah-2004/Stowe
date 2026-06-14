const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        name: String,
        price: Number,
        discount: Number,
        quantity: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);