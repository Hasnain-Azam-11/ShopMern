import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useWishlist } from "../Context/WishlistContext";
import { useCart } from "../Context/CartContext";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function WishlistPage() {
    const { wishlist, fetchWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate  = useNavigate();
    const userId    = "TEMP_USER_ID";
    const items     = wishlist?.items || [];

    useEffect(() => {
        fetchWishlist(userId);
    }, [fetchWishlist, userId]);

    const handleRemove = async (productId) => {
        await removeFromWishlist(userId, productId);
        toast("Removed from wishlist", { icon: "🤍" });
    };

    const handleMoveToCart = async (item) => {
        await addToCart(userId, item.productId, 1);
        await removeFromWishlist(userId, item.productId);
        toast.success("Moved to cart!");
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-3xl mx-auto px-6">

                    {/* Header */}
                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">My Account</p>
                        <h1 className="text-2xl font-bold uppercase tracking-widest">Wishlist</h1>
                        <p className="text-sm text-gray-400 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white border border-gray-200 py-20 text-center">
                            <Heart size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-sm uppercase tracking-widest text-gray-400 mb-6">
                                Your wishlist is empty
                            </p>
                            <button
                                onClick={() => navigate("/allproducts")}
                                className="bg-black text-white text-xs uppercase tracking-widest px-8 py-3 hover:bg-gray-800 transition-colors"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="bg-white border border-gray-200 flex items-center gap-5 p-4 hover:border-gray-300 transition-colors"
                                >
                                    {/* Image */}
                                    <div
                                        className="w-20 h-24 flex-shrink-0 overflow-hidden bg-gray-100 cursor-pointer"
                                        onClick={() => navigate(`/product/${item.productId}`)}
                                    >
                                        <img
                                            src={item.imageURL}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-xs uppercase tracking-widest text-gray-400 mb-0.5 capitalize"
                                        >
                                            {item.category}
                                        </p>
                                        <p
                                            className="text-sm font-medium uppercase tracking-wide truncate cursor-pointer hover:underline"
                                            onClick={() => navigate(`/product/${item.productId}`)}
                                        >
                                            {item.name}
                                        </p>
                                        <p className="text-sm font-semibold mt-1">
                                            Rs. {item.price.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleMoveToCart(item)}
                                            className="flex items-center gap-2 bg-black text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-gray-800 transition-colors"
                                        >
                                            <ShoppingCart size={13} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.productId)}
                                            className="w-9 h-9 border border-gray-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors text-gray-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <Toaster richColors position="top-center" />
        </>
    );
}

export default WishlistPage;