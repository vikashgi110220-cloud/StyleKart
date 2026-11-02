
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

function Wishlist() {
  const {
    items,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "70px 20px" }}>
        <h1>My Wishlist ❤️</h1>
        <h2>Your wishlist is empty!</h2>
        <p>Save your favourite products here.</p>

        <Link to="/" className="view-details-btn">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>
      <h1>My Wishlist ❤️</h1>
      <p>{items.length} saved product(s)</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
          marginTop: "30px",
        }}
      >
        {items.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />

            <h3>{product.name}</h3>
            <p>₹{product.price}</p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => removeFromWishlist(product.id)}
                style={{
                  padding: "10px",
                  border: "1px solid #e63946",
                  borderRadius: "6px",
                  background: "white",
                  color: "#e63946",
                  cursor: "pointer",
                }}
              >
                Remove ❤️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
