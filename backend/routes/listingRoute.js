import express from 'express';
import { getListings, getMyListings, getListingById, createListing, updateListing, deleteListing } from '../controllers/listingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// --- ROUTE ORDER IS CRITICAL ---
// Specific string routes MUST be defined before dynamic routes (like /:id).

// GET /api/listings - Fetch all listings for customers.
router.get('/', getListings);

// GET /api/listings/my-listings - This is now correctly placed BEFORE the general /:id route.
router.get('/my-listings', authMiddleware, getMyListings);

// POST /api/listings/create - Create a new service listing.
router.post('/create', authMiddleware, createListing);

// GET /api/listings/:id - This dynamic route now correctly comes AFTER specific routes.
router.get('/:id', getListingById);

// PUT /api/listings/:id - Update a specific listing.
router.put('/:id', authMiddleware, updateListing);

// DELETE /api/listings/:id - Delete a specific listing.
router.delete('/:id', authMiddleware, deleteListing);

export default router;

