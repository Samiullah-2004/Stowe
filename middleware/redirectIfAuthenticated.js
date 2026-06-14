const jwt = require('jsonwebtoken');
const { userModel } = require('../models/user-model');


module.exports.redirectIfAuthenticated = async function (req, res, next) {
    if (req.cookies && req.cookies.token) {
        try {
            let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);

            let user = await userModel.findOne({ email: decoded.email }).select("-password");

            if (!user) {
                res.clearCookie('token');
                req.flash("error", "User no longer exists.");
                return res.redirect('/');
            }

            return res.redirect('/products');

        } catch (error) {
            res.clearCookie('token');
        }
    }
    next();
};