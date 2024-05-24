const express = require('express');
const router = express.Router();
const { addProduct, getProduct, getAllProduct, deleteById, deleteAll, SearchForAProduct, editProduct } = require('../../controllers/Product/productController');

// Product routes
router.post('/product/new', addProduct);
router.get('/product', getAllProduct);
router.get('/product/search', SearchForAProduct);
router.get('/product/:id', getProduct);
router.delete('/product/:productId', deleteById);
router.delete('/product', deleteAll);
router.put('/product/:productId', editProduct);

module.exports = router;
