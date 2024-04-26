const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');
const authentication = require('../middleware/authentication');
const csrf = require('../middleware/csrf');

router.get('/', csrf, shopController.getIndex);
router.get('/products',  csrf,shopController.getProducts);
router.get('/products/:productid', csrf, shopController.getProduct);
router.get('/categories/:categoryid', csrf, shopController.getProductsByCategoryId);
router.get('/cart', csrf,authentication, shopController.getCart);
router.post('/cart', csrf,authentication, shopController.postCart);
router.post('/delete-cartitem', csrf,authentication, shopController.postCartItemDelete);
router.get('/orders', csrf,authentication, shopController.getOrders);
router.post('/create-order', csrf,authentication, shopController.postOrder);

module.exports = router;