
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/Products.css";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const isSaved = isInWishlist(product.id);

  const handleWishlist = () => {
    if (isSaved) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />

        <button
          type="button"
          className={`wishlist-btn ${isSaved ? "active" : ""}`}
          onClick={handleWishlist}
          aria-label={
            isSaved ? "Remove from wishlist" : "Add to wishlist"
          }
          title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3 className="product-name">{product.name}</h3>

        <p className="product-price">₹{product.price}</p>

        <div className="product-card-actions">
          <Link
            to={`/product/${product.id}`}
            className="view-details-btn"
          >
            View Details
          </Link>

          <button
            type="button"
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
