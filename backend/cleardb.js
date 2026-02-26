const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const collections = await mongoose.connection.db.listCollections().toArray();

        for (const collection of collections) {
            await mongoose.connection.db.dropCollection(collection.name);
            console.log(`  Dropped: ${collection.name}`);
        }

        console.log(`\nCleared ${collections.length} collection(s). Database is now empty.`);
        console.log('Run "node seed.js" to re-seed the database.');

        process.exit(0);
    } catch (error) {
        console.error('Clear DB error:', error.message);
        process.exit(1);
    }
};

clearDB();
