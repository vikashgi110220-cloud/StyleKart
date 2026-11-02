
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get JWT token
  const token = localStorage.getItem("stylekart_token");

  // Fetch all orders
  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Please login as admin first.");
      }

      const response = await fetch(
        "http://localhost:7001/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Update order status
  async function updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(
        `http://localhost:7001/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      await fetchOrders();
    } catch (err) {
      alert(err.message || "Unable to update order status");
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.order_status === "Pending"
  ).length;

  return (
    <main className="admin-dashboard">
      <div className="admin-heading">
        <div>
          <p>STYLEKART ADMIN</p>
          <h1>Orders Dashboard</h1>
          <span>Manage your store orders</span>
        </div>

        <button onClick={fetchOrders} disabled={loading}>
          {loading ? "Loading..." : "Refresh Orders"}
        </button>
      </div>

      <section className="admin-stats">
        <article className="admin-stat">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </article>

        <article className="admin-stat">
          <span>Pending Orders</span>
          <h2>{pendingOrders}</h2>
        </article>

        <article className="admin-stat">
          <span>Order Value</span>
          <h2>₹{totalRevenue.toFixed(2)}</h2>
        </article>
      </section>

      <section className="admin-orders">
        <h2>All Orders</h2>

        {loading && <p>Loading orders...</p>}

        {error && (
          <div>
            <p role="alert">{error}</p>
            <button onClick={fetchOrders}>Try Again</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <p>No orders found yet.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.phone}</td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>₹{Number(order.total_amount).toFixed(2)}</td>
                    <td>{order.payment_method}</td>

                    <td>
                      <select
                        value={order.order_status}
                        onChange={(event) =>
                          updateOrderStatus(order.id, event.target.value)
                        }
                        aria-label={`Update status for order ${order.id}`}
                      >
                        {[
                          "Pending",
                          "Processing",
                          "Shipped",
                          "Delivered",
                          "Cancelled",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <Link to={`/my-orders?orderId=${order.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Link to="/" className="admin-back-link">
        ← Back to Store
      </Link>
    </main>
  );
}

export default AdminDashboard;
