require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('./models/Cart');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // apna actual env variable name check karein
        console.log('Connected to MongoDB');

        const result = await Cart.deleteMany({ userId: 'TEMP_USER_ID' });
        console.log(`Deleted ${result.deletedCount} bad cart(s)`);

    } catch (error) {
        console.error('Cleanup error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();