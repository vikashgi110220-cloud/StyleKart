const { authenticateToken } = require("../middleware/authMiddleware");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();

// SIGNUP API
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUsers] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name.trim(), normalizedEmail, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully!",
            user: {
                id: result.insertId,
                name: name.trim(),
                email: normalizedEmail,
                role: "customer"
            }
        });
    } catch (error) {
        console.error("Signup error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});

/* ========================================
   LOGIN API
======================================== */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await pool.query(
            `SELECT id, name, email, password, role
             FROM users
             WHERE email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to log in."
        });
    }
});

/* ========================================
   GET PROFILE API
======================================== */

router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Get profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch profile."
        });
    }
});


/* ========================================
   UPDATE PROFILE API
======================================== */

router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check whether email is already used by another user
        const [existingUsers] = await pool.query(
            `SELECT id FROM users
             WHERE email = ? AND id != ?`,
            [normalizedEmail, req.user.id]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        await pool.query(
            `UPDATE users
             SET name = ?, email = ?
             WHERE id = ?`,
            [name.trim(), normalizedEmail, req.user.id]
        );

        const [updatedUsers] = await pool.query(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        res.json({
            success: true,
            message: "Profile updated successfully!",
            user: updatedUsers[0]
        });

    } catch (error) {
        console.error("Update profile error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update profile."
        });
    }
});
module.exports = router;
