const mongoose = require('mongoose');
const Product = require('./product');
const { Schema } = mongoose;

const collectionSchema = Schema({
    collectionId: {
        type: String, // Changed from Number to String
        unique: true    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    collectiontype: {
        type: String,
        required: ['product must have a collection',true]
    },
    volume: {
        type: String
    },
    year: {
        type: String
    },
   products: [
        {
            type: String, // Use String type for custom product ID
            ref: 'Product'
        }
    ]
})


// Middleware to handle cascade delete
collectionSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        // Remove all products associated with this collection
        await Product.deleteMany({ collections: this.collectionId });
        next();
    } catch (err) {
        next(err);
    }
});




const Collection = mongoose.model('Collection', collectionSchema)

module.exports = Collection;