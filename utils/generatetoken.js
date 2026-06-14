const jwt = require('jsonwebtoken')

const generateToken = (user) => {
   return jwt.sign(
    { userid: user._id, email: user.email },
    process.env.JWT_KEY,
    { expiresIn: '1d' }
);
};

module.exports.generateToken = generateToken;