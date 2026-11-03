
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/OrderDetails.css";
import API_BASE_URL from "../config/api";
const orderSteps = ["Pending", "Processing", "Shipped", "Delivered"];

function OrderTracking({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="detail-cancelled">
        <strong>Order Cancelled</strong>
        <p>This order has been cancelled.</p>
      </div>
    );
  }

  const currentStep = orderSteps.indexOf(status);

  return (
    <div className="detail-tracking">
      <h3>Order Tracking</h3>

      <div className="detail-tracking-steps">
        {orderSteps.map((step, index) => {
          const completed = currentStep >= index;

          return (
            <div className="detail-step" key={step}>
              <div className={`detail-step-circle ${completed ? "active" : ""}`}>
                {completed ? "✓" : index + 1}
              </div>
              <span className={completed ? "active-text" : ""}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {currentStep === -1 && (
        <p className="detail-unknown-status">Current status: {status}</p>
      )}
    </div>
  );
}

function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      const token = localStorage.getItem("stylekart_token");

      if (!user || !token) {
        setError("Please login to view this order.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/orders/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to fetch order details.");
        }

        setOrder(data.order);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, user]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="detail-spinner"></div>
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <main className="order-detail-page">
        <div className="detail-error">
          <h2>Unable to Load Order</h2>
          <p>{error || "Order not found."}</p>
          <Link to="/my-orders">Back to My Orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-detail-page">
      <div className="detail-header">
        <Link to="/my-orders" className="detail-back-link">
          ← Back to My Orders
        </Link>

        <span className="detail-eyebrow">ORDER INFORMATION</span>
        <h1>Order Details</h1>
        <p>Complete information about your purchase.</p>
      </div>

      <section className="detail-card">
        <div className="detail-card-header">
          <div>
            <span className="detail-label">ORDER NUMBER</span>
            <h2>#{order.id}</h2>
          </div>

          <span className={`detail-status status-${String(order.order_status).toLowerCase()}`}>
            {order.order_status}
          </span>
        </div>

        <div className="detail-info-grid">
          <div>
            <span>Order Date</span>
            <strong>{new Date(order.created_at).toLocaleString()}</strong>
          </div>

          <div>
            <span>Payment Method</span>
            <strong>{order.payment_method}</strong>
          </div>
        </div>

        <OrderTracking status={order.order_status} />

        <div className="detail-products">
          <h3>Products Ordered</h3>

          {order.items?.length > 0 ? (
            <div className="detail-table-wrapper">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{Number(item.price).toFixed(2)}</td>
                      <td>
                        ₹{(
                          Number(item.price) * Number(item.quantity)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No products found in this order.</p>
          )}
        </div>

        <div className="detail-total">
          <span>Total Amount</span>
          <strong>₹{Number(order.total_amount).toFixed(2)}</strong>
        </div>
      </section>

      <div className="detail-footer">
        <Link to="/my-orders">View All Orders</Link>
        <Link to="/" className="detail-shop-button">Continue Shopping</Link>
      </div>
    </main>
  );
}

export default OrderDetails;
