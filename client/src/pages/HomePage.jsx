import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(
          "http://localhost:7001/api/products"
        );

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        // Supports APIs returning either an array or { products: [] }
        const productList = Array.isArray(data)
          ? data
          : data.products || [];

        setProducts(productList.slice(0, 8));
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = [
    {
      name: "Men",
      description: "Explore men's fashion",
      image:
        "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=700",
      search: "men",
    },
    {
      name: "Women",
      description: "Discover women's style",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700",
      search: "women",
    },
    {
      name: "Accessories",
      description: "Complete your look",
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=700",
      search: "accessories",
    },
  ];

  const features = [
    {
      icon: "✦",
      title: "Premium Quality",
      description: "Carefully selected products for your style.",
    },
    {
      icon: "🚚",
      title: "Free Shipping",
      description: "Enjoy free shipping on your orders.",
    },
    {
      icon: "🔒",
      title: "Secure Shopping",
      description: "A simple and secure shopping experience.",
    },
    {
      icon: "↩",
      title: "Easy Shopping",
      description: "Find your favourite products with ease.",
    },
  ];

  return (
    <main className="homepage">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-eyebrow">
            NEW COLLECTION 2026
          </p>

          <h1>
            Discover Your
            <br />
            <span>Own Style.</span>
          </h1>

          <p className="hero-description">
            Upgrade your wardrobe with modern fashion,
            timeless designs and everyday essentials.
          </p>

          <div className="hero-buttons">
            <a href="#products" className="hero-primary-btn">
              Shop Now →
            </a>

            <a href="#categories" className="hero-secondary-btn">
              Explore Collection
            </a>
          </div>

          <div className="hero-trust">
            <span>✓ Quality Products</span>
            <span>✓ Easy Shopping</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
            alt="Fashion clothing collection"
          />

          <div className="hero-image-card">
            <span>STYLEKART COLLECTION</span>
            <strong>Fashion for Everyone</strong>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section" id="categories">
        <div className="section-heading">
          <p className="section-eyebrow">EXPLORE STYLE</p>
          <h2>Shop By Category</h2>
          <p>Find the perfect look for every occasion.</p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <a
              href="#products"
              className="category-card"
              key={category.name}
            >
              <img src={category.image} alt={category.name} />

              <div className="category-overlay">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span>Explore Collection →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="featured-section" id="products">
        <div className="section-heading">
          <p className="section-eyebrow">OUR COLLECTION</p>
          <h2>Featured Products</h2>
          <p>Explore some of our latest fashion picks.</p>
        </div>

        {loading && (
          <p className="home-message">Loading products...</p>
        )}

        {error && (
          <p className="home-error" role="alert">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="home-message">
            No products available right now.
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="featured-products-grid">
            {products.map((product) => (
              <article className="featured-product-card" key={product.id}>
                <Link to={`/product/${product.id}`}>
                  <div className="featured-product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="featured-product-info">
                    <h3>{product.name}</h3>

                    <p className="featured-product-price">
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </Link>

                <Link
                  to={`/product/${product.id}`}
                  className="featured-view-btn"
                >
                  View Product →
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="view-all-wrapper">
          <Link to="/#products" className="view-all-btn">
            Explore Products →
          </Link>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="promo-section">
        <div className="promo-content">
          <p>YOUR STYLE, YOUR IDENTITY</p>

          <h2>
            Fashion That
            <br />
            Speaks For You.
          </h2>

          <p>
            Make every outfit special with StyleKart.
            Find your next favourite look today.
          </p>

          <a href="#products" className="promo-btn">
            Start Shopping →
          </a>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section">
        <div className="section-heading">
          <p className="section-eyebrow">THE STYLEKART PROMISE</p>
          <h2>Why Choose Us?</h2>
          <p>We make your shopping experience simple.</p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000"
            alt="StyleKart fashion collection"
            loading="lazy"
          />
        </div>

        <div className="about-content">
          <p className="section-eyebrow">ABOUT STYLEKART</p>

          <h2>Style Is A Way To Express Yourself.</h2>

          <p>
            StyleKart is your online fashion destination.
            We bring together modern designs and everyday
            essentials to help you discover your personal style.
          </p>

          <p>
            Our goal is to make online fashion shopping
            convenient, enjoyable and accessible.
          </p>

          <a href="#products" className="about-btn">
            Explore Our Collection →
          </a>
        </div>
      </section>

    </main>
  );
}

export default HomePage;