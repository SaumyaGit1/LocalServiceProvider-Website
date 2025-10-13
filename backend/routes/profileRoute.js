import express from 'express';
// Correctly import the default export from the middleware file
import authMiddleware from '../middleware/authMiddleware.js'; 
import { getCategories, saveProfile } from '../controllers/profileController.js';

const router = express.Router();

// --- Public Route ---
// GET /api/profile/categories - Fetches all available service categories.
router.get('/categories', getCategories);

// --- Protected Route ---
// POST /api/profile/setup - Saves the service provider's profile details.
// We apply the authMiddleware here to protect the route.
router.post('/setup', authMiddleware, saveProfile);

export default router;

