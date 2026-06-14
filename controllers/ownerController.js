const ownerModel = require('../models/owner-model');
const productModel = require('../models/product-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.getDashboard = async function(req, res) {
    try {
        const products = await productModel.find().sort({ createdAt: -1 });

        res.render('owner-dashboard', { owner: req.owner, products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.deleteProduct = async function(req, res) {
    try {
        await productModel.findByIdAndDelete(req.params.id);
        req.flash('success', 'Product deleted successfully');
        res.redirect('/owners');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not delete product');
        res.redirect('/owners');
    }
};

module.exports.getLoginPage = function(req, res) {
    res.render('owner-login');
};

module.exports.loginOwner = async function(req, res) {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();

        let owner = await ownerModel.findOne({ email });
        if (!owner) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/owners/login');
        }

        const isPasswordCorrect = await bcrypt.compare(password, owner.password);
        if (!isPasswordCorrect) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/owners/login');
        }

        let token = jwt.sign(
            { email: owner.email },
            process.env.JWT_KEY,
            { expiresIn: '7d' }
        );

        res.cookie("ownerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        req.flash('success', 'Welcome back!');
        return res.redirect('/owners');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong during login.');
        return res.redirect('/owners/login');
    }
};

module.exports.logoutOwner = function(req, res) {
    res.clearCookie('ownerToken');
    res.redirect('/owners/login');
};