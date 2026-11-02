import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 const { wishlistCount } = useWishlist();

  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/login");
  }

  function handleProductsClick() {
    closeMenu();

    if (window.location.pathname === "/") {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      navigate("/#products");
    }
  }

  function handleAboutClick() {
    closeMenu();

    if (window.location.pathname === "/") {
      document.getElementById("about")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      navigate("/#about");
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        Style<span>Kart</span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-content ${menuOpen ? "active" : ""}`}>
        <div className="navbar-links">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <button
            type="button"
            className="navbar-text-link"
            onClick={handleProductsClick}
          >
            Products
          </button>

          <button
            type="button"
            className="navbar-text-link"
            onClick={handleAboutClick}
          >
            About
          </button>

          {user && (
            <Link to="/my-orders" onClick={closeMenu}>
              My Orders
            </Link>
          )}
          <Link to="/wishlist" onClick={closeMenu}>
               ❤️ Wishlist ({wishlistCount})
              </Link>

          {user && (
            <Link to="/profile" onClick={closeMenu}>
              My Profile
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-cart" onClick={closeMenu}>
            🛒 Cart ({cartCount})
          </Link>

          {user ? (
            <div className="navbar-user">
              <span>Hi, {user.name}</span>

              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>

              <Link to="/signup" className="signup-btn" onClick={closeMenu}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
