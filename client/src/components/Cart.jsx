
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";

function Cart() {
  const {
    items = [],
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal = 0,
  } = useCart();

  return (
    <section className="cart-section" id="cart">
      <div className="cart-heading">
        <p className="cart-eyebrow">YOUR SELECTION</p>

        <h2>Your Shopping Cart</h2>

        <p>Review your selected products before checkout.</p>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛍️</div>

          <h3>Your cart is empty</h3>

          <p>Looks like you haven't added anything yet.</p>

          <Link to="/" className="continue-shopping">
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item.id}>
                <img
                  src={item.image || item.imageUrl}
                  alt={item.name}
                />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>

                  <p className="cart-item-price">
                    ₹{item.price}
                  </p>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-line-total">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-total">
              <strong>Total</strong>
              <strong>₹{cartTotal}</strong>
            </div>

            <Link
              to="/checkout"
              className="checkout-button"
            >
              Proceed to Checkout →
            </Link>

            <Link to="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;
