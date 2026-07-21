import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { CheckCircle2, Loader2 } from "lucide-react";

function OrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId]);

    if (loading) return (
        <>
            <NavBar />
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={28} />
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-6">
                <div className="max-w-md w-full bg-white border border-gray-200 p-10 text-center">

                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-5" />

                    <h1 className="text-xl font-bold uppercase tracking-widest mb-2">Order Confirmed!</h1>
                    <p className="text-sm text-gray-400 mb-6">
                        A confirmation email has been sent to{" "}
                        <span className="text-black font-medium">{order?.customerInfo?.email}</span>
                    </p>

                    {order && (
                        <div className="bg-gray-50 border border-gray-100 p-4 mb-8 text-left">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order Number</p>
                            <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                            <p className="text-xs text-gray-400 mt-3 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-sm font-semibold">Rs. {order.total.toLocaleString()}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <Link
                            to={`/order/tracking/${orderId}`}
                            className="w-full bg-black text-white text-xs uppercase tracking-widest py-3.5 hover:bg-gray-800 transition-colors flex items-center justify-center"
                        >
                            Track My Order
                        </Link>
                        <Link
                            to="/products"
                            className="w-full border border-gray-200 text-xs uppercase tracking-widest py-3.5 hover:border-black transition-colors flex items-center justify-center"
                        >
                            Continue Shopping
                        </Link>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}

export default OrderConfirmation;