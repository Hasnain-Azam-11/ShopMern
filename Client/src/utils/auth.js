export const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
        return null;
    }
};

export const getCurrentUserId = () => {
    const user = getCurrentUser();
    return user?._id || user?.id || null;
};

// ✅ NEW — call this right after login AND right after logout.
// CartProvider/WishlistProvider mount only once for the whole app lifetime, so they
// have no other way of knowing a different user just logged in/out without this event.
export const notifyAuthChange = () => {
    window.dispatchEvent(new Event("authChange"));
};