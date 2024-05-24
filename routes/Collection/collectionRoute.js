const express = require('express');
const router = express.Router();
const {
    addCollection,
    getCollection,
    getAllCollection,
    deleteById,
    deleteAll,
    editCollection
      } = require('../../controllers/Collection/collectionController');

// Collection routes
router.get('/collection', getAllCollection);
router.get('/collection/:id', getCollection);
router.post('/collection/new', addCollection);
router.delete('/collection/:collectionId', deleteById);
router.delete('/collection', deleteAll);
router.put('/collection/:collectionId', editCollection);

module.exports = router;
