import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51Tip1D2SsScIndJvYK8DHUYjMlD3afWbhOv1MID6iZVTnNYxLEEDPDLePEpSnPjwGzhMp4Js2CZV4RGXusJ9e2gO00sAtQSVjg");

function StripeWrapper({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

export default StripeWrapper;
