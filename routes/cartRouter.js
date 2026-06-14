const express = require('express');
const { isLoggedIn } = require('../middleware/IsLoggedIn');

const {
    cartController,
    cartPageController,
    subtractCartController,
    removeCartController,
    checkout,
    ordersPageController
} = require('../controllers/cartController');

const router = express.Router();

// The Routes
router.get('/', isLoggedIn, cartPageController);
router.get('/add/:productid', isLoggedIn, cartController);
router.get('/subtract/:productid', isLoggedIn, subtractCartController);
router.get('/remove/:productid', isLoggedIn, removeCartController);
router.post('/checkout',isLoggedIn,checkout)
router.get('/orders', isLoggedIn,ordersPageController);

module.exports = router;