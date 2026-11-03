
import { useEffect, useState } from "react";
import "../styles/AdminProducts.css";
import API_BASE_URL from "../config/api";
const emptyForm = {
  name: "",
  category: "Men",
  price: "",
  image: "",
  description: "",
  stock: "0",
};

const API = API_BASE_URL;

function AdminProducts() {
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch all products (public API)
  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/api/products`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load products");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "Men",
      price: String(product.price ?? ""),
      image: product.image || "",
      description: product.description || "",
      stock: String(product.stock ?? 0),
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Add or Update Product
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0
    ) {
      setError("Please enter a valid price greater than zero.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = editingId !== null;

      const token = localStorage.getItem("stylekart_token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        isEditing
          ? `${API}/api/admin/products/${editingId}`
          : `${API}/api/admin/products`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Could not update product"
              : "Could not add product")
        );
      }

      setMessage(
        isEditing
          ? "Product updated successfully!"
          : `Product added successfully! ID: ${data.productId}`
      );

      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // Delete Product
  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");
    setDeletingId(product.id);

    try {
      const token = localStorage.getItem("stylekart_token");

      if (!token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        `${API}/api/admin/products/${product.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete product");
      }

      if (editingId === product.id) {
        resetForm();
      }

      setMessage(`"${product.name}" deleted successfully!`);
      await fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="admin-products-page">
      <header className="admin-products-header">
        <p>STYLEKART ADMIN</p>
        <h1>Product Management</h1>
        <span>Add, edit and manage your store inventory.</span>
      </header>

      <section className="admin-product-form-card">
        <h2>
          {editingId !== null ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="admin-product-form">
          <label>
            Product Name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength={150}
              placeholder="e.g. Classic White T-Shirt"
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
              <option value="Unisex">Unisex</option>
            </select>
          </label>

          <label>
            Price (₹) *
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="499"
              required
            />
          </label>

          <label>
            Stock Quantity *
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </label>

          <label className="admin-product-full">
            Image URL
            <input
              name="image"
              type="url"
              maxLength={500}
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
            />
          </label>

          <label className="admin-product-full">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product..."
              rows={4}
            />
          </label>

          {message && (
            <p className="admin-product-success" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="admin-product-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-product-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="admin-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-product-list">
        <h2>Existing Products ({products.length})</h2>

        {loading && <p>Loading products...</p>}

        {!loading && products.length === 0 && (
          <p>No products found.</p>
        )}

        {!loading && products.length > 0 && (
          <div className="admin-product-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category || "—"}</td>
                    <td>₹{Number(product.price).toFixed(2)}</td>
                    <td>{product.stock ?? 0}</td>

                    <td>
                      <div className="admin-product-row-actions">
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() => handleEdit(product)}
                          disabled={saving || deletingId !== null}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => handleDelete(product)}
                          disabled={
                            deletingId === product.id ||
                            deletingId !== null ||
                            saving
                          }
                        >
                          {deletingId === product.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminProducts;
