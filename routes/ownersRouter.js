const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owner-model');
const productModel = require('../models/product-model');
const upload = require('../config/productMulter');
const { isOwnerLoggedIn } = require('../middleware/isOwnerLoggedIn');
const { getDashboard, deleteProduct, getLoginPage, loginOwner, logoutOwner } = require('../controllers/ownerController');
const bcrypt = require('bcrypt');

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {

    router.get('/login', getLoginPage);
    router.post('/login', loginOwner);
    router.get('/logout', logoutOwner);

    router.get('/', isOwnerLoggedIn, getDashboard);
    router.get('/products/delete/:id', isOwnerLoggedIn, deleteProduct);
    router.post('/createowner', async function (req, res) {
        try {
            let { fullname, email, password } = req.body;
            let checkowner = await ownerModel.find();

            if (checkowner.length > 0) {
                return res.status(403).send("An owner account already exists. You cannot create another.");
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await ownerModel.create({
                fullname,
                email: email.toLowerCase().trim(),
                password: hashedPassword
            });

            return res.status(201).send("Owner account successfully created!");
        } catch (err) {
            console.error(err);
            return res.status(500).send("Something went wrong on our end.");
        }
    });

    router.get('/createproducts', isOwnerLoggedIn, function(req, res) {
    res.render("createproducts", {
        success: req.flash('success') || [],
        error: req.flash('error') || []
    });
});
}

router.post('/creatingproduct', isOwnerLoggedIn, upload.single('image'), async function(req, res) {
    try {
        let { name, price, discount, stock, bgcolor, panelcolor, textcolor } = req.body;

        if (!req.file) {
            req.flash("error", "Product image file is required.");
            return res.redirect('/owners/createproducts');
        }

        let product = await productModel.create({
            image: req.file.buffer,
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            stock: Number(stock) || 0,
            bgcolor,
            panelcolor,
            textcolor
        });

        req.flash("success", "Product successfully created and published!");
        return res.redirect('/owners/createproducts');

    } catch (error) {
        console.error("Product Processing Error:", error.message);
        req.flash("error", "Internal server error occurred processing document properties.");
        return res.redirect('/owners/createproducts');
    }
});

module.exports = router;
