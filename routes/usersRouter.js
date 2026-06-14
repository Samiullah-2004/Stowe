const express = require('express');
const router = express.Router();
const { userController, loginController } = require('../controllers/userController');

router.post('/register', userController);
router.post('/login', loginController);

module.exports = router;