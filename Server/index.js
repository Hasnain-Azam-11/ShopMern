const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/UserRoutes'); 
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/payment');
const wishlistRoutes = require('./routes/wishlistRoutes');
const { startAbandonedCartJob } = require('./jobs/abandonedCartReminder'); // NEW

const app = express();

dotenv.config();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/products', productRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);  

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
        startAbandonedCartJob(); // NEW - starts the cron job once server + DB are ready
    });
}).catch((error) => {
    console.log('Error connecting to MongoDB', error);
});