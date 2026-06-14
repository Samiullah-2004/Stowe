const jwt = require('jsonwebtoken');
const {userModel} = require('../models/user-model');

module.exports.isLoggedIn = async function (req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        req.flash("error", "You need to login first");
        return res.redirect('/'); 
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        
        let user = await userModel.findOne({ email: decoded.email }).select("-password"); 
        
        if (!user) {
            req.flash("error", "User no longer exists.");
            return res.redirect('/');
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        req.flash("error", "Session expired or invalid. Please log in again.");
        return res.redirect('/');
    }
};