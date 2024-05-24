const mongoose = require('mongoose');
const { Schema } = mongoose;
const Collection = require('./collection')

const productSchema = Schema({
   productId: {
        type: String, // Changed from Number to String
        unique: true
    },
    name: {
        type: String
    },
    price: {
        type: String
    },
    boughtBy: {
        type: String
    },
    url: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    year: {
        type: String
    },
    collections: {
        type: String, // Use String type for custom collection ID
        ref: 'Collection'
    }
})




const Product = mongoose.model('Product', productSchema)

module.exports = Product;