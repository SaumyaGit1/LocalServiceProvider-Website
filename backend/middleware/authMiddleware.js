import jwt from 'jsonwebtoken';
import pool from '../db.js';

const authMiddleware = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // --- FIXED: This query now correctly selects the 'is_admin' column ---
            const [users] = await pool.query('SELECT id, email, role, is_admin FROM users WHERE id = ?', [decoded.id]);
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach the complete user object (including is_admin) to the request
            req.user = users[0];
            next(); // Proceed to the next middleware (adminMiddleware)
        } catch (error) {
            console.error('Token Verification Error:', error.name, error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export default authMiddleware;

