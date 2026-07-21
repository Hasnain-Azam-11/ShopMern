import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "14px",
      color: "#111827",
      fontFamily: "inherit",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
    },
  },
};

function CardPaymentForm({ amount, disabled = false, onValidateCheckout, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleCardPayment = async () => {
    try {
      if (onValidateCheckout && !onValidateCheckout()) {
        return;
      }

      if (!stripe || !elements) {
        setError("Stripe is still loading. Please try again.");
        return;
      }

      setProcessing(true);
      setError("");

      const intentResponse = await fetch("http://localhost:5000/api/payment/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "pkr" }),
      });

      const intentData = await intentResponse.json();
      if (!intentResponse.ok) {
        throw new Error(intentData.error || "Unable to initialize card payment");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card form is not ready");
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message || "Card payment failed");
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        throw new Error("Payment was not completed");
      }

      await onPaymentSuccess?.(paymentIntent);
    } catch (err) {
      setError(err.message || "Card payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="border border-gray-200 bg-white px-4 py-4">
      <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
        Card Details
      </label>
      <div className="border border-gray-200 px-3 py-3 bg-white focus-within:border-black transition-colors">
        <CardElement options={cardElementOptions} />
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      <button
        type="button"
        onClick={handleCardPayment}
        disabled={disabled || processing || !stripe}
        className="w-full bg-black text-white text-xs uppercase tracking-widest py-4 mt-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
        {processing ? "Processing Payment..." : `Pay & Place Order — Rs. ${Number(amount || 0).toLocaleString()}`}
      </button>
    </div>
  );
}

export default CardPaymentForm;
