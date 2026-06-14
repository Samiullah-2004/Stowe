const productModel = require('../models/product-model');

module.exports.productController = async function(req, res) {
    try {
        const { sortby, collection, filter } = req.query;

        let query = {};
        let sortQuery = { createdAt: -1 };

        if (collection === "new") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            query.createdAt = { $gte: sevenDaysAgo };
        }

        if (filter === "discount") {
            query.discount = { $gt: 0 };
        }
        if (filter === "availability") {
            query.stock = { $gt: 0 };
        }

        if (sortby === "newest") {
            sortQuery = { createdAt: -1 };
        } else if (sortby === "discount-rate") {
            query.discount = { $gt: 0 };
            sortQuery = { discount: -1 };
        } else {
            sortQuery = { createdAt: -1 };
        }

        const products = await productModel.find(query).sort(sortQuery);

        res.render('shop', {
            products,
            activeSort: sortby || "popular",
            activeCollection: collection || "all",
            activeFilter: filter || null,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
};