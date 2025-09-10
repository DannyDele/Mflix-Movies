const Product = require('../../model/product');
const Collection = require('../../model/collection')
const handleAsync = require('../../utils/ErrorHandlers/HandleAsync');





// const generateCustomIds = (prefix, year, count = 50) => {
//     const ids = [];
//     for (let i = 0; i < count; i++) {
//         const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
//         ids.push(`${prefix}-${randomNumber}-${year}`);
//     }
//     return ids;
// };






// Funtion to find all products

const getAllProduct = handleAsync(async (req, res) => {
    try {
        const foundProducts = await Product.find();

        if (!foundProducts || foundProducts.length === 0) {
            return res.status(404).json({ msg: 'Products not found or do not exist' });
        }

        // Fetch and map the associated collection for each product
        const productsWithCollections = await Promise.all(foundProducts.map(async (product) => {
            const foundCollection = await Collection.findOne({ collectionId: product.collections });
            return {
                ...product._doc,
                collection: foundCollection ? foundCollection.name : '',
                collectionId: foundCollection ? foundCollection.collectionId : ''
            };
        }));

        res.status(200).json({ msg: 'Found products', foundProducts: productsWithCollections });
    } catch (error) {
        console.error('Error finding products', error);
        res.status(500).json({ error: 'Error finding products' });
    }
});








// Fucntion to find a product
const getProduct = handleAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const foundProduct = await Product.findOne({ productId: id });

        if (!foundProduct) {
            return res.status(404).json({ msg: 'Product not found or does not exist' });
        }

        // Fetch the associated collection using the collectionId stored in the product
        const foundCollection = await Collection.findOne({ collectionId: foundProduct.collections });

        // Transform the data to include the collection name and collectionId in the response
        const transformedProduct = {
            ...foundProduct._doc,
            collection: foundCollection ? foundCollection.name : '',
            collectionId: foundCollection ? foundCollection.collectionId : ''
        };

        res.status(200).json({ msg: 'Found product', foundProduct: transformedProduct });
    } catch (error) {
        console.error('Error finding product', error);
        res.status(500).json({ error: 'Error finding product' });
    }
});



// Funtion to search for a product

const SearchForAProduct = handleAsync(async (req, res) => {
    const { productId } = req.query;
    try {
        const foundProducts = await Product.find({ productId: productId });
        console.log('Found Products:', foundProducts);
        console.log('Product ID:', productId);
        
        if (foundProducts.length === 0 || !foundProducts.some(product => product.productId === productId)) {
            return res.status(400).json({ msg: 'Product with that ID does not exist' });
        }

        res.status(200).json({ msg: 'Found product', foundProducts });
    } catch (error) {
        console.error('Error searching for a product', error);
        res.status(500).json({ error: 'Error searching for a product' });
    }
});






// Controller function to add a product
const addProduct = handleAsync(async (req, res) => {
    const {
        name,
        price,
        boughtBy,
        year,
        collections,
        productId
    } = req.body;

    console.log('Data coming from the frontend:', req.body);

    try {
        const foundCollection = await Collection.findOne({ collectionId: collections });
        if (!foundCollection) {
            return res.status(404).json({ msg: 'Collection not found or does not exist' });
        }

      const foundProductWithThesameId = await Product.findOne({ productId });

        if (foundProductWithThesameId) {
    return res.status(409).json({ msg: 'Product with that ID has already been chosen' });
}


        // Create a new product with the generated IDs
        const newProduct = new Product({
            productId,
            name,
            price,
            boughtBy,
            year,
            collections: foundCollection.collectionId,
            date: new Date()
        });

        // Generate the custom URL
        newProduct.url = `/${foundCollection.name.replace(/\s+/g, '-').toLowerCase()}/${newProduct.productId}`;

        console.log('New Product Created:', newProduct);

        await newProduct.save();

        // Add the productId to the products array of the found collection
        foundCollection.products.push(newProduct.productId);
        await foundCollection.save();

        res.status(201).json({ msg: 'Product Added Successfully!', product: newProduct });
    } catch (error) {
        console.error('Error adding product', error);
        res.status(500).json({ error: 'Error adding product', details: error });
    }
});
    




// Controller function to delete a product by productId
const deleteById = handleAsync(async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('Deleting product with productId:', productId);
        const deletedProduct = await Product.findOneAndDelete({ productId });

        if (!deletedProduct) {
            return res.status(404).json({ msg: 'Product not found or does not exist' });
        }

        res.status(200).json({ msg: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        console.error('Error deleting product', error);
        res.status(500).json({ error: 'Error deleting product', details: error });
    }
});




// Controller function to delete all products
const deleteAll = handleAsync(async (req, res) => {
    try {
        await Product.deleteMany({});
        res.status(200).json({ msg: 'All products deleted successfully' });
    } catch (error) {
        console.error('Error deleting all products', error);
        res.status(500).json({ error: 'Error deleting all products', details: error });
    }
});




// Controller function to edit a product by productId
const editProduct = handleAsync(async (req, res) => {
    try {
        const { productId } = req.params;
        const updates = req.body;

        const updatedProduct = await Product.findOneAndUpdate({ productId }, updates, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ msg: 'Product not found or does not exist' });
        }

        res.status(200).json({ msg: 'Product updated successfully', updatedProduct });
    } catch (error) {
        console.error('Error updating product', error);
        res.status(500).json({ error: 'Error updating product', details: error });
    }
});







module.exports = { addProduct, getProduct, getAllProduct, deleteById, deleteAll, editProduct, SearchForAProduct };