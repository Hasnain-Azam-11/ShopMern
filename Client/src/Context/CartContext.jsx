import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUserId } from "../utils/auth";
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ UPDATED — userId is now REACTIVE STATE instead of a plain value computed once.
    // CartProvider mounts only ONE time for the whole app lifetime — client-side
    // navigation (navigate("/")) after login/logout does NOT remount it. So a plain
    // `const userId = getCurrentUserId()` would get "frozen" at whatever it was when
    // the app first loaded, and never notice that a different user logged in/out later.
    // That's why a signed-out user's cart kept showing up for the next person who
    // logged in on the same tab. Now userId updates whenever an "authChange" event
    // fires (dispatched by Login/Logout via notifyAuthChange()).
    const [userId, setUserId] = useState(getCurrentUserId());

    useEffect(() => {
        const handleAuthChange = () => {
            setUserId(getCurrentUserId());
        };
        window.addEventListener("authChange", handleAuthChange); // ✅ NEW — same-tab login/logout
        window.addEventListener("storage", handleAuthChange);     // ✅ NEW — other-tab login/logout
        return () => {
            window.removeEventListener("authChange", handleAuthChange);
            window.removeEventListener("storage", handleAuthChange);
        };
    }, []);

    // Fetch cart with proper error handling and no race conditions
    const fetchCart = useCallback(async (userId) => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`https://shopmern-9ggl.onrender.com/api/cart/${userId}`);
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
            const response = await fetch('https://shopmern-9ggl.onrender.com/api/cart/add', {
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
            const response = await fetch('https://shopmern-9ggl.onrender.com/api/cart/remove', {  
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
            const response = await fetch('https://shopmern-9ggl.onrender.com/api/cart/update', {
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
            const response = await fetch('https://shopmern-9ggl.onrender.com/api/cart/clear', {
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
            if (!userId) {
                // ✅ UPDATED — if nobody is logged in, clear the cart instead of
                // silently keeping whatever was last loaded (e.g. from a previous user)
                setCart(null);
                return;
            }
            await fetchCart(userId);
        };
        
        loadCart();
        
        return () => {
            isMounted = false;
        };
    }, [fetchCart, userId]);

    // ✅ UPDATED — cache key is now scoped per userId ("cart_<userId>") instead of a
    // single shared "cart" key. Previously ANY logged-in user's cart got cached under
    // the exact same key, so the next person to log in on the same browser would see
    // the previous user's cached items before/if the real fetch corrected it. Now each
    // user only ever reads/writes their own cache slot.
    useEffect(() => {
        if (!userId) return;
        if (cart && cart.items && cart.items.length > 0) {
            localStorage.setItem(`cart_${userId}`, JSON.stringify({
                data: cart,
                timestamp: Date.now()
            }));
        }
    }, [cart, userId]);

    // ✅ UPDATED — restore is now scoped to the current userId's own cache key, and
    // re-runs whenever userId changes (e.g. after a fresh login), instead of running
    // once on mount with a global key that ignored who was actually logged in.
    useEffect(() => {
        if (!userId) {
            setCart(null); // ✅ UPDATED — no logged-in user, don't show any cached cart
            return;
        }

        const restoreFromLocalStorage = () => {
            const saved = localStorage.getItem(`cart_${userId}`);
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
    }, [userId]);

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