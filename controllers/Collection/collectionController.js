const Collection = require('../../model/collection');
const Product = require('../../model/product');
const CustomId = require('../../model/customId');
const handleAsync = require('../../utils/ErrorHandlers/HandleAsync');




// Fucntion to find all collection
const getAllCollection = handleAsync(async (req, res) => {
    try {
        const foundCollections = await Collection.find();

        if (!foundCollections) {  
           res.status(404).json({msg:'Collections not found or does not exist'})
        }

        res.status(200).json({msg: 'Found Collections', foundCollections})

    }
    catch (error) {
        console.log('Error finding collections', error)
        res.status(500).json({error: 'Error finding collections', error})
    }
})






// Fucntion to find a collection
const getCollection = handleAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const foundCollection = await Collection.findOne({ collectionId: id })

        console.log('Found Collection Ids:', foundCollection.customIds);

        if (!foundCollection) {
            return res.status(404).json({ msg: 'Collection not found or does not exist' });
        }

        res.status(200).json({ msg: 'Found Collection', foundCollection });
    } catch (error) {
        console.log('Error finding collection', error);
        res.status(500).json({ error: 'Error finding collection', details: error });
    }
});







// Controller function to create a new collection with unique IDs
const addCollection = handleAsync(async (req, res) => {
    try {
        const { name, description, collectiontype, volume, year, numCustomIds } = req.body;

        // Validate numCustomIds
        if (!numCustomIds || numCustomIds <= 0) {
            return res.status(400).json({ msg: 'Invalid number of custom IDs requested' });
        }

        // Generate a 3-character prefix from the collection name
        const collectionNameAbbreviation = name.substring(0, 3).toUpperCase();

        // Generate an 8-digit random number for collectionId
        const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
        const collectionId = `${collectionNameAbbreviation}-${randomNumber}-${year}`;

        // Generate unique custom IDs
        const generateUniqueId = () => {
            const randomNum = Math.floor(10000000 + Math.random() * 90000000);
            return `${collectionNameAbbreviation}-${randomNum}-${year}`;
        };

        const customIds = new Set();
        while (customIds.size < numCustomIds) {
            customIds.add(generateUniqueId());
        }

        const customIdArray = Array.from(customIds);

        // Create and save new CustomId documents
        const customIdDocs = customIdArray.map(id => ({ customId: id, collection: collectionId }));
        await CustomId.insertMany(customIdDocs);

        // Create a new collection with the generated collection ID and custom IDs
        const newCollection = new Collection({
            collectionId,
            name,
            description,
            collectiontype,
            volume,
            year,
            numCustomIds,  // Set the number of custom IDs
            customIds: customIdArray
        });

        await newCollection.save();
        res.status(201).json({ msg: 'Collection created successfully!', collection: newCollection });
    } catch (error) {
        console.log('Error adding collection', error);
        res.status(500).json({ error: 'Error adding collection', details: error });
    }
});





// Controller function to delete a collection by ID
const deleteById = handleAsync(async (req, res) => {
    try {
        const { collectionId } = req.params;

        // Find the collection by its ID
        const collection = await Collection.findOne({ collectionId });

        if (!collection) {
            return res.status(404).json({ msg: 'Collection not found or does not exist' });
        }

        // Get product IDs associated with the collection
        const productIds = collection.products;

        // Delete the products associated with the collection
        await Product.deleteMany({ productId: { $in: productIds } });

        // Delete the collection itself
        await Collection.deleteOne({ collectionId });

        res.status(200).json({ msg: 'Collection and associated products deleted successfully', deletedCollection: collection });
    } catch (error) {
        console.error('Error deleting collection and products', error);
        res.status(500).json({ error: 'Error deleting collection and products', details: error });
    }
});





// Controller function to delete all collections
const deleteAll = handleAsync(async (req, res) => {
    try {
        await Collection.deleteMany({});
        res.status(200).json({ msg: 'All collections deleted successfully' });
    } catch (error) {
        console.error('Error deleting all collections', error);
        res.status(500).json({ error: 'Error deleting all collections', details: error });
    }
});



// Controller function to edit a collection
const editCollection = handleAsync(async (req, res) => {
    try {
        const { collectionId } = req.params;
        const updates = req.body;

        const updatedCollection = await Collection.findOneAndUpdate({ collectionId }, updates, { new: true });

        if (!updatedCollection) {
            return res.status(404).json({ msg: 'Collection not found or does not exist' });
        }

        res.status(200).json({ msg: 'Collection updated successfully', updatedCollection });
    } catch (error) {
        console.error('Error updating collection', error);
        res.status(500).json({ error: 'Error updating collection', details: error });
    }
});

module.exports = { addCollection, getCollection, getAllCollection, deleteById, deleteAll, editCollection };