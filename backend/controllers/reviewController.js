import pool from '../db.js';

// --- Create a new review ---
export const createReview = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { booking_id, listing_id, rating, comment } = req.body;

        if (!booking_id || !listing_id || !rating) {
            return res.status(400).json({ message: 'Booking ID, listing ID, and rating are required.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // Security Check: Verify that this customer actually made this booking and it's 'Completed'
        const [bookingCheck] = await pool.query(
            'SELECT * FROM bookings WHERE id = ? AND customer_id = ? AND status = "Completed"',
            [booking_id, customerId]
        );

        if (bookingCheck.length === 0) {
            return res.status(403).json({ message: "You are not authorized to review this booking, or it is not yet completed." });
        }

        const newReview = { booking_id, listing_id, customer_id: customerId, rating, comment };
        await pool.query('INSERT INTO reviews SET ?', newReview);

        res.status(201).json({ message: 'Thank you for your review!' });

    } catch (error) {
        // Handle unique constraint violation (review already exists for this booking)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'You have already submitted a review for this booking.' });
        }
        console.error("Create Review Error:", error);
        res.status(500).json({ message: "Server error while submitting review." });
    }
};

// --- Get all reviews for a specific listing ---
export const getReviewsForListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const [reviews] = await pool.query(
            `SELECT r.rating, r.comment, r.created_at, u.email as customer_email 
             FROM reviews r
             JOIN users u ON r.customer_id = u.id
             WHERE r.listing_id = ? 
             ORDER BY r.created_at DESC`,
            [listingId]
        );
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ message: "Server error while fetching reviews." });
    }
};
