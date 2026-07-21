import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userId = "TEMP_USER_ID";

    // Fetch cart with proper error handling and no race conditions
    const fetchCart = useCallback(async (userId) => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            const data = await response.json();
            setCart(data);
            return data;
        } catch (error) {
            console.error("Error fetching cart:", error);
            setError(error.message);
            setCart(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Add to cart
    const addToCart = useCallback(async (userId, productId, quantity, selectedAttributes = {}) => {
        if (!userId || !productId) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId, 
                    productId, 
                    quantity,
                    selectedAttributes 
                })
            });
            
            if (!response.ok) throw new Error('Failed to add to cart');
            const data = await response.json();
            setCart(data);
            return data;
        } catch (error) {
            console.error("Error adding to cart:", error);
            setError(error.message);
        }
    }, []);

    // Remove from cart
    const removeFromCart = useCallback(async (userId, productId) => {
        if (!userId || !productId) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/cart/remove', {  
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId })
            });
            
            if (!response.ok) throw new Error('Failed to remove from cart');
            const data = await response.json();
            setCart(data);
            return data;
        } catch (error) {
            console.error("Error removing from cart:", error);
            setError(error.message);
        }
    }, []);

    // Update quantity
    const updateQuantity = useCallback(async (userId, productId, quantity) => {
        if (!userId || !productId) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/cart/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId, quantity })
            });
            
            if (!response.ok) throw new Error('Failed to update quantity');
            const data = await response.json();
            setCart(data);
            return data;
        } catch (error) {
            console.error("Error updating quantity:", error);
            setError(error.message);
        }
    }, []);

    // Clear entire cart
    const clearCart = useCallback(async (userId) => {
        if (!userId) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/cart/clear', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            
            if (!response.ok) throw new Error('Failed to clear cart');
            const data = await response.json();
            setCart(data);
            return data;
        } catch (error) {
            console.error("Error clearing cart:", error);
            setError(error.message);
        }
    }, []);

    // Load cart on initial mount with debounce
    useEffect(() => {
        let isMounted = true;
        
        const loadCart = async () => {
            if (!isMounted) return;
            await fetchCart(userId);
        };
        
        loadCart();
        
        return () => {
            isMounted = false;
        };
    }, [fetchCart, userId]);

    // Optional: Save cart to localStorage for persistence
    useEffect(() => {
        if (cart && cart.items && cart.items.length > 0) {
            localStorage.setItem('cart', JSON.stringify({
                data: cart,
                timestamp: Date.now()
            }));
        }
    }, [cart]);

    // Optional: Restore cart from localStorage on page load if API fails
    useEffect(() => {
        const restoreFromLocalStorage = () => {
            const saved = localStorage.getItem('cart');
            if (saved) {
                try {
                    const { data, timestamp } = JSON.parse(saved);
                    // Only restore if less than 1 hour old
                    if (Date.now() - timestamp < 3600000) {
                        setCart(data);
                    }
                } catch (e) {
                    console.error("Error restoring cart:", e);
                }
            }
        };
        
        restoreFromLocalStorage();
    }, []);

    return (
        <CartContext.Provider value={{ 
            cart, 
            loading, 
            error,
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            fetchCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 