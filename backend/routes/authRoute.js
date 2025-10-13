// --- Imports ---
import express from 'express';
import { signup, login } from '../controllers/authController.js';

// --- Router Setup ---
const router = express.Router();

// --- Route Definitions ---
// POST /api/auth/signup - Handles new user registration
router.post('/signup', signup);

// POST /api/auth/login - Handles user login
router.post('/login', login);

// --- Export ---
export default router;
