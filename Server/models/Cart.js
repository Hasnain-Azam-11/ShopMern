const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageURL: {
        type: String,  // just store the first image
        default: ''
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type:String,
        ref: 'User',
        required: true,
        unique: true   // one cart per user
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    },
    // NEW - needed for abandoned cart tracking
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSentAt: {
        type: Date,
        default: null
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Auto calculate total before saving
cartSchema.pre('save', function () {
    this.totalAmount = this.items.reduce(
        (total, item) => total + item.price * item.quantity, 0
    );

    // NEW - every time the cart is actually saved with modified items,
    // treat it as fresh activity: update lastActivityAt, and reset reminderSent
    // so a returning user who adds something new can get reminded again later.
    if (this.isModified('items')) {
        this.lastActivityAt = new Date();
        this.reminderSent = false;
        this.reminderSentAt = null;
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;