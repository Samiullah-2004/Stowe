const { generateToken } = require('../utils/generatetoken');
const bcrypt = require('bcrypt');
const { userModel, validateRegisterUser, validateLoginUser } = require('../models/user-model');

module.exports.userController = async function (req, res) {
    const { error } = validateRegisterUser(req.body);
    if (error) {
        req.flash("registerError", error.details[0].message);
        return res.redirect('/');
    }

    try {
        let { fullname, email, password } = req.body;
        email = email.toLowerCase().trim();

        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            req.flash("registerError", "An account with this email already exists.");
            return res.redirect('/');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user = await userModel.create({
            fullname,
            email,
            password: hashedPassword
        });

        let token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        req.flash("success", "Registration successful!");
        return res.redirect('/products');

    } catch (err) {
        console.error(err);
        req.flash("registerError", "Something went wrong during registration.");
        return res.redirect('/');
    }
}

module.exports.loginController = async function (req, res) {
   const { error } = validateLoginUser(req.body);
if (error) {
    req.flash("loginError", error.details[0].message);
    return res.redirect('/');
}

    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();

        let existingUser = await userModel.findOne({ email });
        if (!existingUser) {
            req.flash("loginError", "Invalid email or password.");
return res.redirect('/');
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            req.flash("loginError", "Invalid email or password.");
return res.redirect('/');
        }

        let token = generateToken(existingUser);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect('/products');

    } catch (err) {
    console.error(err);
    req.flash("loginError", "Something went wrong during login.");
    return res.redirect('/');
}
};

module.exports.getAccountPage = function (req, res) {
    res.render('account', { user: req.user });
};


module.exports.uploadProfilePic = async function (req, res) {
    try {
        if (req.file) {
            await userModel.findByIdAndUpdate(req.user._id, {
                profilepic: req.file.filename
            });
            req.flash('success', 'Profile picture updated');
        }
        res.redirect('/account');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};