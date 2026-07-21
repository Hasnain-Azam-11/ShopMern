import { createContext, useContext, useState, useCallback } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState({ items: [] });

    const fetchWishlist = useCallback(async (userId) => {
        try {
            const res  = await fetch(`http://localhost:5000/api/wishlist/${userId}`);
            const data = await res.json();
            setWishlist(data);
        } catch (err) {
            console.error('Failed to fetch wishlist', err);
        }
    }, []);

    const addToWishlist = useCallback(async (userId, product) => {
        try {
            const res = await fetch('http://localhost:5000/api/wishlist/add', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    productId: product._id,
                    name:      product.name,
                    price:     product.price,
                    imageURL:  Array.isArray(product.imageURL) ? product.imageURL[0] : product.imageURL,
                    category:  product.category,
                })
            });
            const data = await res.json();
            setWishlist(data.wishlist);
        } catch (err) {
            console.error('Failed to add to wishlist', err);
        }
    }, []);

    const removeFromWishlist = useCallback(async (userId, productId) => {
        try {
            const res  = await fetch(`http://localhost:5000/api/wishlist/${userId}/${productId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            setWishlist(data.wishlist);
        } catch (err) {
            console.error('Failed to remove from wishlist', err);
        }
    }, []);

    const isWishlisted = useCallback((productId) => {
        return wishlist.items.some(item => item.productId === productId || item.productId?._id === productId);
    }, [wishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, fetchWishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);