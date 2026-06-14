const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
    fullname: {
        type: String,
        minlength: 3,
        trim: true
    },
    email: String,
    password: String,
    products: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],
        default: []
    },
    picture: String,
    gstin: String
}, { timestamps: true });

module.exports = mongoose.model("owner",ownerSchema)