
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/MyOrders.css";

const orderSteps = ["Pending", "Processing", "Shipped", "Delivered"];

function OrderTracking({ status }) {
  const isCancelled = status === "Cancelled";
  const currentStep = orderSteps.indexOf(status);

  if (isCancelled) {
    return (
      <div className="tracking-cancelled">
        <strong>Order Cancelled</strong>
        <p>This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <h3>Order Tracking</h3>

      <div className="tracking-steps">
        {orderSteps.map((step, index) => {
          const completed = currentStep >= index;

          return (
            <div className="tracking-step" key={step}>
              <div className={`step-circle ${completed ? "completed" : ""}`}>
                {completed ? "✓" : index + 1}
              </div>

              <span className={completed ? "step-active" : ""}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {currentStep === -1 && (
        <p className="unknown-status">Current status: {status}</p>
      )}
    </div>
  );
}

function MyOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMyOrders() {
      const token = localStorage.getItem("stylekart_token");

      if (!user || !token) {
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:7001/api/my-orders",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to fetch orders.");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  return (
    <main className="my-orders-page">
      <div className="orders-header">
        <span className="orders-eyebrow">YOUR SHOPPING JOURNEY</span>
        <h1>My Orders</h1>
        <p>View your purchases and track your orders in one place.</p>
      </div>

      {error && (
        <div className="orders-error" role="alert">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <section className="no-orders">
          <div className="no-orders-icon">🛍️</div>
          <h2>No Orders Yet!</h2>
          <p>
            You haven't placed any orders. Start exploring our collection.
          </p>
          <Link to="/" className="orders-shop-button">
            Start Shopping
          </Link>
        </section>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <section className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <span className="order-label">ORDER ID</span>
                <h2>#{order.id}</h2>
              </div>

              <div className="order-header-actions">
                <span
                  className={`order-status status-${String(
                    order.order_status
                  ).toLowerCase()}`}
                >
                  {order.order_status}
                </span>

                <Link
                  to={`/orders/${order.id}`}
                  className="view-order-button"
                >
                  View Details →
                </Link>
              </div>
            </div>

            <div className="order-meta">
              <div>
                <span>Order Date</span>
                <strong>
                  {new Date(order.created_at).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Payment Method</span>
                <strong>{order.payment_method}</strong>
              </div>
            </div>

            <OrderTracking status={order.order_status} />

            <div className="order-products">
              <h3>Order Items</h3>

              {order.items?.length > 0 ? (
                <div className="order-table-wrapper">
                  <table className="order-table">
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
                <p className="no-order-items">No products found.</p>
              )}
            </div>

            <div className="order-total">
              <span>Total Amount</span>
              <strong>
                ₹{Number(order.total_amount).toFixed(2)}
              </strong>
            </div>
          </section>
        ))}
      </div>

      <div className="orders-footer">
        <Link to="/">← Continue Shopping</Link>
      </div>
    </main>
  );
}

export default MyOrders;
