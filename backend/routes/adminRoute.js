import express from 'express';
import { 
    getAnalytics,
    getAllProviders, 
    updateProviderStatus,
    getAllUsers, // NEW
    updateUserStatus // NEW
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// All routes are protected by both auth and admin middleware.

router.get('/analytics', authMiddleware, adminMiddleware, getAnalytics);
router.get('/providers', authMiddleware, adminMiddleware, getAllProviders);
router.put('/providers/:providerId/status', authMiddleware, adminMiddleware, updateProviderStatus);

// NEW: Routes for general user management
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.put('/users/:userId/status', authMiddleware, adminMiddleware, updateUserStatus);

export default router;

