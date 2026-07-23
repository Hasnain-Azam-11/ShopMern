const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add to cart
const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        // First find the product to get its details
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Find existing cart or create new one
        let cart = await Cart.findOne({ userId });

        if (cart) {
            const itemIndex = cart.items.findIndex(
                item => item.productId.toString() === productId
            );

            if (itemIndex > -1) {
                // Product already in cart, increase quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // New product, add to cart
                cart.items.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    imageURL: product.imageURL[0] || '',
                    quantity
                });
            }
        } else {
            // No cart exists, create one
            cart = new Cart({
                userId,
                items: [{
                    productId,
                    name: product.name,
                    price: product.price,
                    imageURL: product.imageURL[0] || '',
                    quantity
                }]
            });
        }

        await cart.save();
        res.status(200).json(cart);

    } catch (error) {
        console.log("Cart error:", error.message); 
        res.status(500).json({ message: error.message });
    }
};

// Get cart by userId (UPDATED)
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        
        if (!cart) {
            // Return empty cart instead of 404
            return res.status(200).json({
                userId: req.params.userId,
                items: [],
                totalAmount: 0
            });
        }
        
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove one item from cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        await cart.save();
        res.status(200).json(cart);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update quantity of an item
const updateQuantity = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });

        cart.items[itemIndex].quantity = quantity;

        await cart.save();
        res.status(200).json(cart);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = [];
        await cart.save();
        res.status(200).json({ message: 'Cart cleared' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addToCart, getCart, removeFromCart, updateQuantity, clearCart };