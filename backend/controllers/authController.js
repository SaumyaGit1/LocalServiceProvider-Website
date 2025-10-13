import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- (signup function is unchanged) ---
export const signup = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) return res.status(400).json({ message: "Please provide email, password, and role." });
        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters long." });

        const [existingUser] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) return res.status(409).json({ message: "An account with this email already exists." });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = { email, password: hashedPassword, role };
        await pool.query('INSERT INTO users SET ?', newUser);
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ message: "Server error during registration." });
    }
};


// --- Login Controller (UPDATED for admin role) ---
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Please provide email and password." });

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: "Invalid credentials." });
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

        let isProfileComplete = true;
        if (user.role === 'Service Provider') {
            const [profile] = await pool.query('SELECT user_id FROM provider_profiles WHERE user_id = ?', [user.id]);
            if (profile.length === 0) isProfileComplete = false;
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            is_admin: user.is_admin === 1 // NEW: Add admin status to the token
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: "Logged in successfully!",
            token: token,
            user: {
                email: user.email,
                role: user.role,
                isProfileComplete,
                is_admin: user.is_admin === 1 // NEW: Send admin status to frontend
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error during login." });
    }
};

