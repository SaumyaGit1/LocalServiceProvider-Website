import pool from '../db.js';

// --- Get All Listings (UPDATED to include average rating) ---
export const getListings = async (req, res) => {
    try {
        const { search, category, location } = req.query;
        let query = `
            SELECT 
                sl.id, sl.title, sl.description, sl.price, sl.provider_id,
                pp.name AS provider_name,
                pp.location AS provider_location,
                sc.name AS category_name,
                (SELECT AVG(r.rating) FROM reviews r WHERE r.listing_id = sl.id) AS average_rating
            FROM service_listings sl
            JOIN provider_profiles pp ON sl.provider_id = pp.user_id
            JOIN service_categories sc ON sl.category_id = sc.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ` AND (sl.title LIKE ? OR pp.name LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category && category !== '') {
            query += ` AND sl.category_id = ?`;
            params.push(category);
        }
        if (location) {
            query += ` AND pp.location LIKE ?`;
            params.push(`%${location}%`);
        }

        const [listings] = await pool.query(query, params);
        res.status(200).json(listings);

    } catch (error) {
        console.error("Get Listings Error:", error.message);
        res.status(500).json({ message: "Server error while fetching listings." });
    }
};

// --- Get a Single Listing by ID (UPDATED to include reviews) ---
export const getListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const [listings] = await pool.query(
            `SELECT sl.*, pp.name as provider_name 
             FROM service_listings sl
             JOIN provider_profiles pp ON sl.provider_id = pp.user_id
             WHERE sl.id = ?`,
            [id]
        );

        if (listings.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        
        // Also fetch reviews for this listing
        const [reviews] = await pool.query(
            `SELECT r.rating, r.comment, r.created_at, u.email as customer_email 
             FROM reviews r
             JOIN users u ON r.customer_id = u.id
             WHERE r.listing_id = ? 
             ORDER BY r.created_at DESC`,
            [id]
        );

        const listingData = {
            ...listings[0],
            reviews: reviews
        };
        
        res.status(200).json(listingData);
    } catch (error) {
        console.error("Get Listing By ID Error:", error.message);
        res.status(500).json({ message: "Server error while fetching listing." });
    }
};


// --- (Other functions: createListing, getMyListings, etc. remain the same) ---
export const createListing = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { title, description, price, category_id } = req.body;
        if (!title || !price || !category_id) {
            return res.status(400).json({ message: "Title, price, and category are required." });
        }
        const newListing = { provider_id: providerId, title, description, price, category_id };
        await pool.query('INSERT INTO service_listings SET ?', newListing);
        res.status(201).json({ message: 'Service listing created successfully!' });
    } catch (error) {
        console.error("Create Listing Error:", error.message);
        res.status(500).json({ message: "Server error while creating listing." });
    }
};
export const getMyListings = async (req, res) => {
    try {
        const providerId = req.user.id;
        const [myListings] = await pool.query(
            'SELECT sl.*, sc.name as category_name FROM service_listings sl JOIN service_categories sc ON sl.category_id = sc.id WHERE sl.provider_id = ?',
            [providerId]
        );
        res.status(200).json(myListings);
    } catch (error) {
        console.error("Get My Listings Error:", error.message);
        res.status(500).json({ message: "Server error while fetching your listings." });
    }
};
export const updateListing = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { id } = req.params;
        const { title, description, price, category_id } = req.body;
        const [result] = await pool.query(
            'UPDATE service_listings SET title = ?, description = ?, price = ?, category_id = ? WHERE id = ? AND provider_id = ?',
            [title, description, price, category_id, id, providerId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Listing not found or you're not authorized to edit it." });
        }
        res.status(200).json({ message: 'Listing updated successfully!' });
    } catch (error) {
        console.error("Update Listing Error:", error.message);
        res.status(500).json({ message: "Server error while updating listing." });
    }
};
export const deleteListing = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { id } = req.params;
        const [result] = await pool.query(
            'DELETE FROM service_listings WHERE id = ? AND provider_id = ?',
            [id, providerId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Listing not found or you're not authorized to delete it." });
        }
        res.status(200).json({ message: 'Listing deleted successfully!' });
    } catch (error) {
        console.error("Delete Listing Error:", error.message);
        res.status(500).json({ message: "Server error while deleting listing." });
    }
};

