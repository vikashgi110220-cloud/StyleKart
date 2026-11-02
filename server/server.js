const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const {
  authenticateToken,
  requireAdmin,
} = require("./middleware/authMiddleware");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// ========================================
// HOME ROUTE
// ========================================
app.get("/", (req, res) => {
  res.send("StyleKart Backend is running! 🚀");
});

// ========================================
// DATABASE TEST
// ========================================
app.get("/api/db-test", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT 1 AS connected");

    res.json({
      success: true,
      message: "MySQL connected successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "MySQL connection failed",
    });
  }
});

// ========================================
// GET ALL PRODUCTS
// ========================================
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products");

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// ========================================
// GET REVIEWS FOR A PRODUCT
// ========================================
app.get("/api/products/:id/reviews", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const [products] = await pool.query(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [reviews] = await pool.query(
      `SELECT
          r.id,
          r.product_id,
          r.user_id,
          r.rating,
          r.comment,
          r.created_at,
          r.updated_at,
          u.name AS customer_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const [ratingData] = await pool.query(
      `SELECT
          COUNT(*) AS total_reviews,
          COALESCE(AVG(rating), 0) AS average_rating
       FROM reviews
       WHERE product_id = ?`,
      [productId]
    );

    res.json({
      success: true,
      reviews,
      totalReviews: Number(ratingData[0].total_reviews),
      averageRating: Number(
        Number(ratingData[0].average_rating).toFixed(1)
      ),
    });

  } catch (error) {
    console.error("Fetch reviews error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product reviews",
    });
  }
});



// POST: Add Product Review (Verified Purchase Only)
app.post("/api/reviews", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;

    // Validate product ID
    if (!Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID is required",
      });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Validate comment
    if (comment && typeof comment !== "string") {
      return res.status(400).json({
        success: false,
        message: "Comment must be text",
      });
    }

    // Check product exists
    const [products] = await pool.query(
      "SELECT id FROM products WHERE id = ?",
      [Number(product_id)]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check verified purchase (Cancelled orders excluded)
    const [purchases] = await pool.query(
      `SELECT oi.id
       FROM order_items oi
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ?
       AND oi.product_id = ?
       AND LOWER(o.order_status) != 'cancelled'
       LIMIT 1`,
      [userId, Number(product_id)]
    );

    if (purchases.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can review only products you have purchased",
      });
    }

    // Insert review
    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [Number(product_id), userId, rating, comment?.trim() || null]
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      reviewId: result.insertId,
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    console.error("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
});


// ========================================
// TEST ROUTE
// ========================================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Products route testing server is working!",
  });
});

// ========================================
// GET ALL ORDERS OF LOGGED-IN CUSTOMER
// ========================================
app.get("/api/my-orders", authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          "SELECT * FROM order_items WHERE order_id = ?",
          [order.id]
        );

        return {
          ...order,
          items,
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error("My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
});

// ========================================
// GET ORDER BY ID - AUTHENTICATED
// ========================================
app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    let orders;

    if (req.user.role === "admin") {
      [orders] = await pool.query(
        "SELECT * FROM orders WHERE id = ?",
        [orderId]
      );
    } else {
      [orders] = await pool.query(
        "SELECT * FROM orders WHERE id = ? AND user_id = ?",
        [orderId, req.user.id]
      );
    }

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const [items] = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId]
    );

    res.json({
      success: true,
      order: orders[0],
      items,
    });
  } catch (error) {
    console.error("Fetch order error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
});

// ========================================
// POST: PLACE A NEW ORDER - AUTHENTICATED
// ========================================
app.post("/api/orders", authenticateToken, async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();

    const {
      customer_name,
      phone,
      address,
      city,
      pincode,
      items,
    } = req.body;

    // 1. Validate customer details
    if (
      !customer_name?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all customer details.",
      });
    }

    // 2. Validate cart items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    const seenIds = new Set();

    for (const item of items) {
      const id = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        seenIds.has(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart items.",
        });
      }

      seenIds.add(id);
    }

    // 3. Start database transaction
    await connection.beginTransaction();
    transactionStarted = true;

    let totalAmount = 0;
    const verifiedItems = [];

    // 4. Verify prices and stock from MySQL
    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      const [products] = await connection.query(
        `SELECT id, name, price, stock
         FROM products
         WHERE id = ?
         FOR UPDATE`,
        [productId]
      );

      if (products.length === 0) {
        throw new Error(`Product ${productId} was not found.`);
      }

      const product = products[0];
      const price = Number(product.price);
      const stock = Number(product.stock);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(stock) ||
        price < 0
      ) {
        throw new Error("Invalid product price or stock.");
      }

      if (stock < quantity) {
        throw new Error(
          `${product.name} does not have enough stock.`
        );
      }

      totalAmount += price * quantity;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price,
        quantity,
      });
    }

    // 5. Save order with authenticated user's ID
    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (
         user_id,
         customer_name,
         phone,
         address,
         city,
         pincode,
         total_amount,
         payment_method,
         order_status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', 'Pending')`,
      [
        req.user.id,
        customer_name.trim(),
        phone.trim(),
        address.trim(),
        city.trim(),
        pincode.trim(),
        totalAmount.toFixed(2),
      ]
    );

    const orderId = orderResult.insertId;

    // 6. Save order items and reduce stock
    for (const item of verifiedItems) {
      await connection.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.name,
          item.quantity,
          item.price.toFixed(2),
        ]
      );

      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.productId]
      );
    }

    // 7. Commit transaction
    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId,
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: "COD",
      orderStatus: "Pending",
    });

  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError.message);
      }
    }

    console.error("Order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to place order.",
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// ========================================
// ADMIN: GET ALL ORDERS
// ========================================
app.get(
  "/api/admin/orders",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [orders] = await pool.query(
        "SELECT * FROM orders ORDER BY created_at DESC"
      );

      res.json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error("Admin orders error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  }
);

// ========================================
// ADMIN: UPDATE ORDER STATUS
// ========================================
app.patch(
  "/api/admin/orders/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const orderId = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const [result] = await pool.query(
        "UPDATE orders SET order_status = ? WHERE id = ?",
        [status, orderId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.json({
        success: true,
        message: "Order status updated successfully",
        orderId,
        status,
      });
    } catch (error) {
      console.error("Update order status error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      });
    }
  }
);

// ========================================
// ADMIN: ADD PRODUCT
// ========================================
app.post(
  "/api/admin/products",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { name, category, price, image, description, stock } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      const productPrice = Number(price);
      const productStock = Number(stock);

      if (
        price === "" ||
        price === undefined ||
        !Number.isFinite(productPrice) ||
        productPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than zero",
        });
      }

      if (
        stock === "" ||
        stock === undefined ||
        !Number.isSafeInteger(productStock) ||
        productStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative whole number",
        });
      }

      const [result] = await pool.query(
        `INSERT INTO products
         (name, category, price, image, description, stock)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          category?.trim() || null,
          productPrice,
          image?.trim() || null,
          description?.trim() || null,
          productStock,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Product added successfully!",
        productId: result.insertId,
      });
    } catch (error) {
      console.error("Add product error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to add product",
      });
    }
  }
);

// ========================================
// ADMIN: EDIT PRODUCT
// ========================================
app.put(
  "/api/admin/products/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, price, image, description, stock } = req.body;

      if (
        !name?.trim() ||
        price === undefined ||
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0 ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid name, price and stock.",
        });
      }

      const [result] = await pool.query(
        `UPDATE products
         SET name = ?, category = ?, price = ?,
             image = ?, description = ?, stock = ?
         WHERE id = ?`,
        [
          name.trim(),
          category || null,
          Number(price),
          image || null,
          description || null,
          Number(stock),
          id,
        ]
      );

      if (result.affectedRows === 0) {
        const [existing] = await pool.query(
          "SELECT id FROM products WHERE id = ?",
          [id]
        );

        if (existing.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Product not found.",
          });
        }
      }

      res.json({
        success: true,
        message: "Product updated successfully!",
      });
    } catch (error) {
      console.error("Update product error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to update product.",
      });
    }
  }
);

// ========================================
// ADMIN: DELETE PRODUCT
// ========================================
app.delete(
  "/api/admin/products/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        "DELETE FROM products WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully!",
      });
    } catch (error) {
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          success: false,
          message:
            "This product is linked to existing orders. It cannot be deleted.",
        });
      }

      console.error("Delete product error:", error.message);

      res.status(500).json({
        success: false,
        message: "Failed to delete product.",
      });
    }
  }
);

// ========================================
// SERVER START
// ========================================
const PORT = process.env.PORT || 7001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});