const orderModel = require('../models/order-model');
const productModel = require('../models/product-model');
const { userModel } = require('../models/user-model');


module.exports.cartController = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/products');
        }

        let product = await productModel.findById(req.params.productid);
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('/products');
        }

        let currentQty = user.cart.filter(
            id => id.toString() === req.params.productid
        ).length;

        if (currentQty >= product.stock) {
            req.flash('error', `Only ${product.stock} unit(s) of "${product.name}" available.`);
            return res.redirect(req.get('Referrer') || '/products');
        }

        user.cart.push(req.params.productid);
        await user.save();

        req.flash('success', 'Product successfully added!');

        res.redirect(req.get('Referrer') || '/products');
    } catch (error) {
        console.error("Cart add error:", error);
        req.flash('error', 'Something went wrong while updating your cart.');
        res.redirect('/products');
    }
}

module.exports.subtractCartController = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        // Find the first instance of this ID
        let index = user.cart.indexOf(req.params.productid);

        if (index !== -1) {
            user.cart.splice(index, 1);
            await user.save();
        }
        res.redirect('/cart');
    } catch (error) {
        console.error("Cart subtract error:", error);
        res.redirect('/cart');
    }
}

module.exports.removeCartController = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        user.cart = user.cart.filter(item => item.toString() !== req.params.productid);
        await user.save();

        req.flash('success', 'Item removed from cart.');
        res.redirect('/cart');
    } catch (error) {
        console.error("Cart remove error:", error);
        res.redirect('/cart');
    }
}

module.exports.cartPageController = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        if (!user) return res.redirect('/products');

        let uniqueProducts = await productModel.find({
            _id: { $in: user.cart }
        });

        let products = user.cart.map(cartItemId => {
            return uniqueProducts.find(p => p._id.toString() === cartItemId.toString());
        }).filter(p => p != null);

        res.render('cart', { products: products });

    } catch (error) {
        console.error("Error loading cart page:", error);
        res.status(500).send("Internal Server Error");
    }
};



module.exports.checkout = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/cart');
        }

        if (!user.cart || user.cart.length === 0) {
            req.flash('error', 'Your cart is empty');
            return res.redirect('/cart');
        }

        let uniqueProductsData = await productModel.find({
            _id: { $in: user.cart }
        });

        let itemCounts = {};
        let uniqueProducts = [];

        user.cart.forEach(cartItemId => {
            const id = cartItemId.toString();
            if (!itemCounts[id]) {
                itemCounts[id] = 0;
                const product = uniqueProductsData.find(p => p._id.toString() === id);
                if (product) uniqueProducts.push(product);
            }
            itemCounts[id]++;
        });

        let orderProducts = [];
        let totalMRP = 0;
        let totalDiscount = 0;

        for (const product of uniqueProducts) {
            const qty = itemCounts[product._id.toString()];

            if (qty > product.stock) {
                req.flash('error', `Sorry, only ${product.stock} unit(s) of "${product.name}" left in stock. Please update your cart.`);
                return res.redirect('/cart');
            }

            const basePrice = Number(product.price) * qty;
            const itemDiscount = Number(product.discount || 0) * qty;

            totalMRP += basePrice + itemDiscount;
            totalDiscount += itemDiscount;

            orderProducts.push({
                product: product._id,
                name: product.name,
                price: product.price,
                discount: product.discount || 0,
                quantity: qty
            });
        }

        const platformFee = 20;
        const totalAmount = (totalMRP - totalDiscount) + platformFee;

        await orderModel.create({
            user: user._id,
            products: orderProducts,
            totalAmount: totalAmount
        });

        for (const item of orderProducts) {
            await productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        user.cart = [];
        await user.save();

        req.flash('success', 'Order placed successfully!');
        res.redirect('/cart/orders');

    } catch (err) {
        console.error("Checkout error:", err);
        req.flash('error', 'Something went wrong while placing your order');
        res.redirect('/cart');
    }
};



module.exports.ordersPageController = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        if (!user) return res.redirect('/products');

        let orders = await orderModel.find({ user: user._id }).sort({ createdAt: -1 });

        res.render('orders', { orders });
    } catch (error) {
        console.error("Error loading orders:", error);
        res.status(500).send("Internal Server Error");
    }
};