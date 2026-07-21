import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { Package, CheckCircle2, Truck, MapPin, Clock, XCircle } from "lucide-react";

const STATUS_STEPS = [
    { key: "pending",    label: "Order Placed",   icon: Clock,         desc: "We've received your order" },
    { key: "processing", label: "Processing",      icon: Package,       desc: "Your order is being prepared" },
    { key: "shipped",    label: "Shipped",         icon: Truck,         desc: "Your order is on its way" },
    { key: "delivered",  label: "Delivered",       icon: CheckCircle2,  desc: "Order delivered successfully" },
];

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered"];

function OrderTracking() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
                if (!res.ok) throw new Error("Order not found");
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                setError(err.message);
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
                <p className="text-xs uppercase tracking-widest text-gray-400 animate-pulse">Loading order...</p>
            </div>
            <Footer />
        </>
    );

    if (error || !order) return (
        <>
            <NavBar />
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <XCircle size={40} className="text-red-400" />
                <p className="text-xs uppercase tracking-widest text-gray-400">Order not found</p>
            </div>
            <Footer />
        </>
    );

    const isCancelled = order.orderStatus === "cancelled";
    const currentIndex = isCancelled ? -1 : STATUS_ORDER.indexOf(order.orderStatus);
    const shippingLabels = { standard: "Standard (3–5 days)", express: "Express (1–2 days)", overnight: "Overnight" };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-6">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Order Tracking</p>
                        <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900">{order.orderNumber}</h1>
                        <p className="text-sm text-gray-400 mt-2">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Cancelled State */}
                    {isCancelled ? (
                        <div className="bg-white border border-red-200 p-8 text-center mb-6">
                            <XCircle size={40} className="text-red-400 mx-auto mb-3" />
                            <p className="text-sm font-medium uppercase tracking-widest text-red-500">Order Cancelled</p>
                            <p className="text-xs text-gray-400 mt-2">This order has been cancelled.</p>
                        </div>
                    ) : (
                        /* Tracking Timeline */
                        <div className="bg-white border border-gray-200 p-8 mb-6">
                            <div className="relative">
                                {/* Progress Line Background */}
                                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 z-0"
                                     style={{ left: '24px', right: '24px' }} />
                                {/* Progress Line Fill */}
                                <div
                                    className="absolute top-6 h-0.5 bg-black z-0 transition-all duration-700"
                                    style={{
                                        left: '24px',
                                        width: currentIndex <= 0 ? '0%'
                                            : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`
                                    }}
                                />

                                <div className="relative z-10 flex justify-between">
                                    {STATUS_STEPS.map((step, index) => {
                                        const Icon = step.icon;
                                        const isCompleted = index <= currentIndex;
                                        const isCurrent = index === currentIndex;

                                        return (
                                            <div key={step.key} className="flex flex-col items-center gap-3" style={{ width: '25%' }}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                                    isCompleted
                                                        ? "bg-black border-black text-white"
                                                        : "bg-white border-gray-200 text-gray-300"
                                                } ${isCurrent ? "ring-4 ring-black/10" : ""}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-xs font-medium uppercase tracking-widest ${
                                                        isCompleted ? "text-black" : "text-gray-300"
                                                    }`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-xs text-gray-400 mt-1 leading-tight">{step.desc}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Details */}
                    <div className="bg-white border border-gray-200 p-6 mb-6">
                        <h2 className="text-xs uppercase tracking-widest font-medium mb-4 pb-3 border-b border-gray-100">
                            Order Details
                        </h2>
                        <div className="flex flex-col gap-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <img
                                        src={item.imageURL}
                                        alt={item.name}
                                        className="w-14 h-16 object-cover bg-gray-100 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium uppercase tracking-wide">{item.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        Rs. {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Subtotal</span>
                                <span>Rs. {order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Shipping ({shippingLabels[order.shippingMethod]})</span>
                                <span>Rs. {order.shipping.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Tax</span>
                                <span>Rs. {order.tax.toLocaleString()}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>- Rs. {order.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                                <span className="uppercase tracking-widest">Total</span>
                                <span>Rs. {order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white border border-gray-200 p-6">
                        <h2 className="text-xs uppercase tracking-widest font-medium mb-4 pb-3 border-b border-gray-100">
                            Shipping Address
                        </h2>
                        <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {order.customerInfo.firstName} {order.customerInfo.lastName}<br />
                                {order.customerInfo.address}
                                {order.customerInfo.apartment && `, ${order.customerInfo.apartment}`}<br />
                                {order.customerInfo.city}, {order.customerInfo.postalCode}<br />
                                {order.customerInfo.country}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}

export default OrderTracking;