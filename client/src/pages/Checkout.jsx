import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/Checkout.css";
import API_BASE_URL from "../config/api";
function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!items || items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("stylekart_token");

      if (!token) {
        setError("Please login before placing your order.");
        navigate("/login");
        return;
      }

      const orderItems = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

     const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          items: orderItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place your order.");
      }

      setOrderId(data.orderId || data.order_id || data.id);
      setOrderTotal(data.totalAmount || data.total || cartTotal);

      clearCart();
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Order confirmation screen
  if (submitted) {
    return (
      <div className="checkout-container">
        <div className="checkout-success">
          <div className="success-icon">✓</div>

          <h2>Order Placed Successfully!</h2>

          <p>
            Thank you for shopping with <strong>StyleKart</strong>.
          </p>

          <div className="success-details">
            <p>
              <strong>Order ID:</strong> #{orderId}
            </p>

            <p>
              <strong>Total Amount:</strong> ₹
              {Number(orderTotal).toFixed(2)}
            </p>

            <p>
              <strong>Payment Method:</strong> Cash on Delivery
            </p>

            <p>
              <strong>Order Status:</strong> Pending
            </p>
          </div>

          <button
            className="checkout-button"
            onClick={() => navigate("/my-orders")}
          >
            View My Orders
          </button>

          <button
            className="continue-shopping"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Empty cart screen
  if (!items || items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <h2>Your Cart is Empty</h2>

          <p>Add some products before proceeding to checkout.</p>

          <button
            className="checkout-button"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-heading">
        <p className="checkout-eyebrow">Almost There</p>
        <h1>Checkout</h1>
        <p>Enter your details to complete your order.</p>
      </div>

      <div className="checkout-layout">
        {/* Customer Information Form */}
        <div className="checkout-form-section">
          <h2>Shipping Information</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Full Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="House number, street, area..."
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">PIN Code</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                placeholder="6-digit PIN code"
                value={formData.pincode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
            </div>

            <div className="payment-method">
              <h3>Payment Method</h3>

              <div className="payment-option">
                <span>💵</span>
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay when your order arrives.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="checkout-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="checkout-button"
              disabled={loading}
            >
              {loading ? "Placing Your Order..." : "Place Order (COD) →"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="summary-products">
            {items.map((item) => (
              <div className="summary-product" key={item.id}>
                <div className="summary-product-image">
                  <img
                    src={item.image}
                    alt={item.name}
                  />
                </div>

                <div className="summary-product-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <span>
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{Number(cartTotal).toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span className="free-shipping">Free</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row summary-total">
            <strong>Total</strong>
            <strong>₹{Number(cartTotal).toFixed(2)}</strong>
          </div>

          <p className="secure-checkout">
            🔒 Your order information is securely submitted.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;