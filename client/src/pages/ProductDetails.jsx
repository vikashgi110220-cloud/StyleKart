
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/ProductDetails.css";
import API_BASE_URL from "../config/api";
function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch product
  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setQuantity(1);

        const response = await fetch(
        `${API_BASE_URL}/api/products`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to fetch products.");
        }

        const foundProduct = (data.products || []).find(
          (item) => String(item.id) === String(id)
        );

        if (!foundProduct) {
          throw new Error("Product not found.");
        }

        if (!cancelled) {
          setProduct(foundProduct);
          setQuantity(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load product.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch product reviews
  const fetchReviews = async () => {
    try {
      setReviewLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/products/${id}/reviews`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Failed to load reviews.");
      }

      setReviews(data.reviews || []);
      setAverageRating(Number(data.averageRating) || 0);
      setTotalReviews(Number(data.totalReviews) || 0);
    } catch (err) {
      console.error("Reviews Error:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Check whether current user has already reviewed
  const hasReviewed = reviews.some(
    (review) => String(review.user_id) === String(user?.id)
  );

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    if (!token) {
      setReviewMessage("Please login to submit a review.");
      return;
    }

    if (hasReviewed) {
      setReviewMessage("You have already reviewed this product.");
      return;
    }

    if (!comment.trim()) {
      setReviewMessage("Please enter your review comment.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
       `${API_BASE_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: Number(id),
            rating,
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit review.");
      }

      setReviewMessage("Review submitted successfully!");
      setComment("");
      setRating(5);

      await fetchReviews();
    } catch (err) {
      setReviewMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="product-not-found">
        <h2>Loading Product...</h2>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-not-found">
        <h2>{error || "Product Not Found"}</h2>
        <Link to="/">Back to Home</Link>
      </section>
    );
  }

  const stock = Number(product.stock) || 0;
  const price = Number(product.price) || 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <>
      {/* Product Details */}
      <section className="product-details">
        <div className="product-details-image">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x600?text=Image+Unavailable";
            }}
          />
        </div>

        <div className="product-details-info">
          <p className="product-details-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <h2>₹{price.toFixed(2)}</h2>

          <p className="product-details-description">
            {product.description ||
              `Discover the ${product.name} from StyleKart. A great addition to your everyday wardrobe.`}
          </p>

          <p className={stock > 0 ? "stock-available" : "stock-unavailable"}>
            {stock > 0
              ? `In Stock: ${stock}`
              : "Currently Out of Stock"}
          </p>

          {stock > 0 && (
            <div className="quantity-wrapper">
              <label>Quantity:</label>

              <div className="quantity-selector">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => Math.max(1, prev - 1))
                  }
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.min(stock, prev + 1)
                    )
                  }
                  disabled={quantity >= stock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <p className="product-total">
            Total: ₹{(price * quantity).toFixed(2)}
          </p>

          <button
            className="details-add-button"
            onClick={handleAddToCart}
            disabled={stock <= 0 || quantity > stock}
          >
            {stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>

          <p className="back-link">
            <Link to="/">← Continue Shopping</Link>
          </p>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="product-reviews">
        <h2>Customer Reviews & Ratings</h2>

        <div className="reviews-summary">
          <h3>{averageRating.toFixed(1)} / 5</h3>

          <div className="review-stars">
            {"★".repeat(Math.round(averageRating))}
            {"☆".repeat(5 - Math.round(averageRating))}
          </div>

          <p>Based on {totalReviews} review(s)</p>
        </div>

        {/* Review Form */}
        <div className="review-form-container">
          <h3>Write a Review</h3>

          {reviewLoading ? (
            <p>Loading review details...</p>
          ) : !user ? (
            <p>Please login to write a review.</p>
          ) : hasReviewed ? (
            <p className="review-message">
              You have already reviewed this product. Thank you for your feedback!
            </p>
          ) : (
            <form onSubmit={handleSubmitReview}>
              <label>Your Rating:</label>

              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "active" : ""}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star rating`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label htmlFor="review-comment">
                Your Comment:
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows="4"
                maxLength="1000"
                required
              />

              <button
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          {reviewMessage && (
            <p className="review-message">
              {reviewMessage}
            </p>
          )}
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          <h3>Customer Feedback</h3>

          {reviewLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div className="review-card" key={review.id}>
                <h4>{review.customer_name}</h4>

                <div className="review-stars">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <p>{review.comment}</p>

                <small>
                  {new Date(review.created_at).toLocaleDateString()}
                </small>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}

export default ProductDetails;
