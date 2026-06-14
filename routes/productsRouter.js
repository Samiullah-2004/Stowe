const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/IsLoggedIn'); 
const { productController } = require('../controllers/productController');

router.get('/', isLoggedIn,productController);



module.exports = router;