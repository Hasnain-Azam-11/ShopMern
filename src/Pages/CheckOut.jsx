import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Lock, Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { useCart } from "../Context/CartContext";
import StripeWrapper from "../Components/StripeWrapper";
import CardPaymentForm from "../Components/CardPaymentForm";

function InputField({ label, placeholder, type = "text", half = false, required = false, name, value = "", onChange }) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white"
        required={required}
      />
    </div>
  );
}

function Checkout() {
  const { cart, fetchCart, updateQuantity, removeFromCart, loading: cartLoading } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    country: "Pakistan"
  });

  const userId = "TEMP_USER_ID";

  useEffect(() => {
    fetchCart(userId);
  }, [fetchCart, userId]);

  const shippingCosts = {
    standard: 599,
    express: 1299,
    overnight: 2499
  };

  const shipping = shippingCosts[selectedShipping] || 599;

  // ✅ FIX: Cart items already have name, price, imageURL stored directly
  const cartItems = cart?.items || [];

  // ✅ FIX: Use item.price directly (not item.productId.price)
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax - discount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(userId, productId);
    } else {
      await updateQuantity(userId, productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(userId, productId);
  };

  const handleApplyPromo = () => {
    if (promoCode === "SAVE10") {
      setDiscount(subtotal * 0.1);
      alert("✅ Promo code applied! 10% discount");
    } else if (promoCode === "SAVE20") {
      setDiscount(subtotal * 0.2);
      alert("✅ Promo code applied! 20% discount");
    } else {
      alert("❌ Invalid promo code");
    }
  };

  const validateForm = () => {
    const required = ['email', 'phone', 'firstName', 'lastName', 'address', 'city', 'postalCode'];
    for (const field of required) {
      if (!formData[field]) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!formData.email.includes('@')) {
      alert('Please enter a valid email address');
      return false;
    }
    if (formData.phone.length < 10) {
      alert('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const validateCheckoutState = () => {
    if (!validateForm()) return false;
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return false;
    }
    return true;
  };

  const buildOrderData = (overrides = {}) => ({
    userId,
    items: cartItems,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    paymentMethod,
    shippingMethod: selectedShipping,
    customerInfo: {
      email: formData.email,
      phone: formData.phone,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country
    },
    ...overrides
  });

  const submitOrderRequest = async (orderData) => {
    setPlacingOrder(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Order placed successfully!\nOrder Number: ${data.order.orderNumber}`);
        window.location.href = `/order-confirmation/${data.order._id}`;
        return true;
      }

      alert(`❌ Failed to place order: ${data.error}`);
      return false;
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
      return false;
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateCheckoutState()) return;
    const orderData = buildOrderData({ paymentMethod: "cod" });
    await submitOrderRequest(orderData);
  };

  const handleCardPaymentSuccess = async (paymentIntent) => {
    const orderData = buildOrderData({
      paymentMethod: "card",
      paymentStatus: "paid",
      stripePaymentIntentId: paymentIntent.id
    });
    await submitOrderRequest(orderData);
  };

  if (cartLoading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-xs uppercase tracking-widest text-gray-400 ml-2">Loading cart...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">

          <h1 className="text-2xl font-bold uppercase tracking-widest mb-10 text-center">
            Checkout
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200">
              <p className="text-gray-400 uppercase tracking-widest mb-4">Your cart is empty</p>
              <Button
                className="bg-black text-white hover:bg-gray-800"
                onClick={() => window.location.href = "/products"}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

              {/* Left — Forms */}
              <div className="flex flex-col gap-8">

                <div>
                  <h2 className="text-sm uppercase tracking-widest font-medium mb-4 pb-2 border-b border-gray-200">
                    Contact Information
                  </h2>
                  <div className="flex flex-col gap-4">
                    <InputField label="Email Address" placeholder="john@example.com" type="email" required name="email" value={formData.email} onChange={handleInputChange} />
                    <InputField label="Phone Number" placeholder="+92 300 0000000" type="tel" required name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>

                <div>
                  <h2 className="text-sm uppercase tracking-widest font-medium mb-4 pb-2 border-b border-gray-200">
                    Shipping Address
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                      <InputField label="First Name" placeholder="John" half required name="firstName" value={formData.firstName} onChange={handleInputChange} />
                      <InputField label="Last Name" placeholder="Doe" half required name="lastName" value={formData.lastName} onChange={handleInputChange} />
                    </div>
                    <InputField label="Address" placeholder="123 Main Street" required name="address" value={formData.address} onChange={handleInputChange} />
                    <InputField label="Apartment, Suite, etc. (optional)" placeholder="Apt 4B" name="apartment" value={formData.apartment} onChange={handleInputChange} />
                    <div className="flex gap-4">
                      <InputField label="City" placeholder="Lahore" half required name="city" value={formData.city} onChange={handleInputChange} />
                      <InputField label="Postal Code" placeholder="54000" half required name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-500 mb-1 block">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-white"
                      >
                        <option>Pakistan</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>UAE</option>
                        <option>Canada</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm uppercase tracking-widest font-medium mb-4 pb-2 border-b border-gray-200">
                    Payment Method
                  </h2>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex-1 py-2.5 text-xs uppercase tracking-widest border transition-all ${
                        paymentMethod === "cod"
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-200 hover:border-black"
                      }`}
                    >
                      Cash on Delivery
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 py-2.5 text-xs uppercase tracking-widest border transition-all ${
                        paymentMethod === "card"
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-gray-200 hover:border-black"
                      }`}
                    >
                      Card Payment
                    </button>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="bg-gray-50 border border-gray-200 px-4 py-4">
                      <p className="text-sm text-gray-600">
                        Pay with cash when your order is delivered. No additional charges.
                      </p>
                    </div>
                  )}
                  {paymentMethod === "card" && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-gray-50 border border-gray-200 px-4 py-4">
                        <p className="text-sm text-gray-600">
                          Pay securely using your debit or credit card via Stripe.
                        </p>
                      </div>
                      <StripeWrapper>
                        <CardPaymentForm
                          amount={total}
                          disabled={placingOrder}
                          onValidateCheckout={validateCheckoutState}
                          onPaymentSuccess={handleCardPaymentSuccess}
                        />
                      </StripeWrapper>
                    </div>
                  )}
                </div>
                {paymentMethod === "cod" && (
                  <Button
                    className="w-full bg-black text-white text-xs uppercase tracking-widest py-6 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    {placingOrder ? "Processing..." : `Place Order — Rs. ${total.toLocaleString()}`}
                  </Button>
                )}

              </div>

              {/* Right — Order Summary */}
              <div>
                <div className="bg-white border border-gray-200 p-6 sticky top-28">
                  <button
                    className="w-full flex items-center justify-between mb-4 lg:cursor-default"
                    onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
                  >
                    <h2 className="text-sm uppercase tracking-widest font-medium">
                      Order Summary ({cartItems.length} items)
                    </h2>
                    <ChevronDown
                      size={16}
                      className={`lg:hidden transition-transform ${orderSummaryOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div className={`flex flex-col gap-4 ${orderSummaryOpen ? "block" : "hidden lg:block"}`}>

                    {cartItems.map((item) => {
                      // ✅ FIX: Read directly from item, not item.productId
                      const productName = item.name || "Unknown Product";
                      const productPrice = item.price || 0;
                      const productImage = item.imageURL || "https://via.placeholder.com/80";

                      return (
                        <div key={item.productId} className="flex gap-4 pb-4 border-b border-gray-100">
                          <div className="relative w-20 h-24 flex-shrink-0 bg-gray-100">
                            <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                            <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <p className="text-sm font-medium uppercase tracking-wide">{productName}</p>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                  className="w-6 h-6 border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-sm w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                  className="w-6 h-6 border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <p className="text-sm font-semibold mt-2">
                              Rs. {(productPrice * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4 flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 border border-gray-200 px-3 py-2 text-xs outline-none focus:border-black transition-colors"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="bg-black text-white text-xs uppercase tracking-widest px-4 hover:bg-gray-800 transition-colors"
                        >
                          Apply
                        </button>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>- Rs. {discount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span>Rs. {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Shipping ({selectedShipping})</span>
                          <span>Rs. {shipping.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tax (10%)</span>
                          <span>Rs. {tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-3 mt-1">
                          <span className="uppercase tracking-widest">Total</span>
                          <span>Rs. {total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Checkout;