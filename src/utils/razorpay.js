// Added: loads Razorpay Standard Checkout (checkout.js) on demand, only on the
// Premium page. Payments are created and verified by the backend; this file only
// opens Razorpay's payment window.
const CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let loading = null;

export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!loading) {
    loading = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = CHECKOUT_URL;
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => {
        loading = null; // allow a retry
        script.remove();
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return loading;
};

// Remembers an order that is still being confirmed, so a refresh keeps checking it
const PENDING_KEY = "devtinder:pendingOrder";
export const savePendingOrder = (orderId) => {
  try {
    if (orderId) localStorage.setItem(PENDING_KEY, orderId);
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    // storage unavailable: only the current page keeps checking
  }
};
export const readPendingOrder = () => {
  try {
    return localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
};

export const formatPrice = (paise, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);
