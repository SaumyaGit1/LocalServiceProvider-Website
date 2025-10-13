import express from 'express';
import { 
    setAvailability, 
    getAvailability, 
    getAvailableSlots, 
    createBooking, 
    getMyBookings,
    updateBookingStatus // Ensure this function is imported
} from '../controllers/bookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Protected Provider Routes ---
router.post('/availability', authMiddleware, setAvailability);
router.get('/availability', authMiddleware, getAvailability);

// --- Public / Protected Customer Routes ---
router.get('/slots/:providerId', getAvailableSlots);
router.post('/create', authMiddleware, createBooking);

// --- Protected Route for both Customers and Providers ---
router.get('/my-bookings', authMiddleware, getMyBookings);

// --- FIXED: This route was missing or incorrect, causing the 404 error ---
router.put('/:bookingId/status', authMiddleware, updateBookingStatus);

export default router;

