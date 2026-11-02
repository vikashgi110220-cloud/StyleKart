import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProductSection from "./components/ProductSection";

import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Cart from "./components/Cart";
import OrderDetails from "./pages/OrderDetails";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import "./App.css";

// Login protection
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin role protection
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Hero Section
function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="hero-tag">NEW COLLECTION 2026</p>

        <h1>
          Discover Your
          <br />
          Own Style
        </h1>

        <p className="hero-description">
          Upgrade your wardrobe with trendy fashion. Find your perfect style
          with StyleKart.
        </p>

        <a href="#products" className="hero-btn">
          Shop Now
        </a>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80"
          alt="Fashion clothing collection"
        />
      </div>
    </section>
  );
}

// Benefits Section
function Benefits() {
  const benefits = [
    {
      icon: "🚚",
      title: "Free Shipping",
      description: "On eligible orders",
    },
    {
      icon: "🔒",
      title: "Secure Payment",
      description: "Safe checkout experience",
    },
    {
      icon: "↩️",
      title: "Easy Returns",
      description: "Simple return process",
    },
    {
      icon: "⭐",
      title: "Quality Products",
      description: "Fashion you can trust",
    },
  ];

  return (
    <section className="benefits">
      {benefits.map((benefit) => (
        <div className="benefit-item" key={benefit.title}>
          <span className="benefit-icon">{benefit.icon}</span>

          <div>
            <h3>{benefit.title}</h3>
            <p>{benefit.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// About Section
function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-image">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
          alt="Fashion outfits"
        />
      </div>

      <div className="about-content">
        <p className="section-tag">ABOUT STYLEKART</p>

        <h2>Fashion That Matches Your Personality</h2>

        <p>
          StyleKart brings together modern trends and everyday comfort. Discover
          fashion that helps you express your personality and feel confident in
          your style.
        </p>

        <a href="#products" className="about-btn">
          Explore Collection
        </a>
      </div>
    </section>
  );
}

// Newsletter Section
function Newsletter() {
  function handleSubmit(event) {
    event.preventDefault();
    alert("Thanks for subscribing to StyleKart!");
    event.currentTarget.reset();
  }

  return (
    <section className="newsletter">
      <h2>Stay Updated with StyleKart</h2>

      <p>Subscribe for updates about new collections and offers.</p>

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email address"
          aria-label="Email address"
          required
        />

        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
}

// Home Page
function HomePage() {
  return (
    <main>
      <Hero />
      <Benefits />
      <ProductSection />
      <About />
      <Newsletter />
    </main>
  );
}

// Footer
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <a href="#home" className="footer-logo">
            Style<span>Kart</span>
          </a>

          <p>Your style, your choice. Discover fashion with StyleKart.</p>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#about">About Us</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} StyleKart. All rights reserved.</p>
      </div>
    </footer>
  );
}

// Main App
function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Admin Products */}
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route path="/cart" element={<Cart />} />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* Customer Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

         <Route path="/wishlist" element={<Wishlist />} /> 





        {/* 404 Page */}
        <Route
          path="*"
          element={
            <main style={{ textAlign: "center", padding: "80px 20px" }}>
              <h1>404 - Page Not Found</h1>
              <a href="/">Return to Home</a>
            </main>
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
