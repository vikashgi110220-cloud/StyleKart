
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import "../styles/Products.css";

function ProductSection() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from MySQL through the Express API
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:7001/api/products",
          { signal: controller.signal }
        );

        const data = await response.json();

        console.log("API response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || `Request failed (${response.status})`
          );
        }

        // Support both { success: true, products: [...] }
        // and a direct array response.
        const productList = Array.isArray(data)
          ? data
          : data.products;

        if (!Array.isArray(productList)) {
          throw new Error(
            "Invalid API response: products array not found."
          );
        }

        setProducts(productList);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Error fetching products:", err);
        setError(err.message || "Unable to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);

  // Search, category filtering and sorting
  const filteredProducts = products
    .filter((product) => {
      const productName = String(product.name || "");

      const matchesSearch = productName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === "low-high") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "high-low") {
        return Number(b.price) - Number(a.price);
      }

      if (sort === "name") {
        return String(a.name || "").localeCompare(
          String(b.name || "")
        );
      }

      return 0;
    });

  // Retry loading products
  function handleRetry() {
    window.location.reload();
  }

  // Reset all filters
  function clearFilters() {
    setSearch("");
    setCategory("All");
    setSort("default");
  }

  return (
    <section className="products-section" id="products">
      <div className="products-heading">
        <div>
          <p className="section-eyebrow">CURATED FOR YOU</p>
          <h2>Trending Collection</h2>
          <p className="section-description">
            Discover your next favourite look.
          </p>
        </div>

        <span className="products-count">
          {loading
            ? "Loading..."
            : `${filteredProducts.length} products`}
        </span>
      </div>

      <ProductFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
      />

      {loading ? (
        <div className="no-products">
          <h3>Loading products...</h3>
          <p>Please wait while we fetch the latest collection.</p>
        </div>
      ) : error ? (
        <div className="no-products">
          <h3>Oops! Something went wrong.</h3>
          <p>{error}</p>

          <button type="button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="no-products">
          <h3>No products found</h3>
          <p>
            Try another search or choose a different category.
          </p>

          <button type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}

export default ProductSection;
