import express from 'express';
import { createReview, getReviewsForListing } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Protected Customer Route to create a review ---
// POST /api/reviews
router.post('/', authMiddleware, createReview);

// --- Public Route to get all reviews for a specific listing ---
// GET /api/reviews/listing/:listingId
router.get('/listing/:listingId', getReviewsForListing);

export default router;
