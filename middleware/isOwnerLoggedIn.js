const jwt = require('jsonwebtoken');
const ownerModel = require('../models/owner-model');

module.exports.isOwnerLoggedIn = async function (req, res, next) {
    if (!req.cookies || !req.cookies.ownerToken) {
        req.flash("error", "Please login first");
        return res.redirect('/owners/login');
    }

    try {
        let decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);

        let owner = await ownerModel.findOne({ email: decoded.email }).select("-password");

        if (!owner) {
            res.clearCookie('ownerToken');
            req.flash("error", "Owner account not found.");
            return res.redirect('/owners/login');
        }

        req.owner = owner;
        next();

    } catch (error) {
        res.clearCookie('ownerToken');
        req.flash("error", "Session expired. Please log in again.");
        return res.redirect('/owners/login');
    }
};