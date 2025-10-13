import pool from '../db.js';

// --- (Existing functions: getAnalytics, getAllProviders, updateProviderStatus) ---

// --- NEW: Get All Users (Customers and Providers) ---
export const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT id, email, role, status, created_at 
            FROM users
            WHERE is_admin = FALSE -- Exclude other admins from the list
            ORDER BY created_at DESC
        `);
        res.status(200).json(users);
    } catch (error) {
        console.error("Admin: Get All Users Error:", error);
        res.status(500).json({ message: "Server error while fetching users." });
    }
};

// --- NEW: Update Any User's Status ---
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['Active', 'Suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const [result] = await pool.query(
            'UPDATE users SET status = ? WHERE id = ? AND is_admin = FALSE', // Safety check to prevent suspending other admins
            [status, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or is an administrator.' });
        }

        res.status(200).json({ message: `User status updated to ${status}.` });

    } catch (error) {
        console.error("Admin: Update User Status Error:", error);
        res.status(500).json({ message: "Server error while updating user status." });
    }
};
export const getAnalytics = async (req, res) => {
    try {
        const [userCountResult] = await pool.query("SELECT COUNT(*) as count FROM users");
        const [providerCountResult] = await pool.query("SELECT COUNT(*) as count FROM provider_profiles WHERE status = 'Approved'");
        const [bookingCountResult] = await pool.query("SELECT COUNT(*) as count FROM bookings");
        const [topCategoriesResult] = await pool.query(`
            SELECT sc.name, COUNT(b.id) as bookingCount 
            FROM bookings b
            JOIN service_listings sl ON b.listing_id = sl.id
            JOIN service_categories sc ON sl.category_id = sc.id
            GROUP BY sc.name 
            ORDER BY bookingCount DESC 
            LIMIT 5
        `);

        const analytics = {
            totalUsers: userCountResult[0].count,
            totalProviders: providerCountResult[0].count,
            totalBookings: bookingCountResult[0].count,
            topCategories: topCategoriesResult
        };

        res.status(200).json(analytics);

    } catch (error) {
        console.error("Admin: Get Analytics Error:", error);
        res.status(500).json({ message: "Server error while fetching analytics data." });
    }
};
export const getAllProviders = async (req, res) => {
    try {
        const [providers] = await pool.query(`
            SELECT 
                u.id, 
                u.email, 
                pp.name, 
                pp.location, 
                pp.status,
                pp.created_at
            FROM users u
            JOIN provider_profiles pp ON u.id = pp.user_id
            WHERE u.role = 'Service Provider'
            ORDER BY pp.created_at DESC
        `);
        res.status(200).json(providers);
    } catch (error) {
        console.error("Admin: Get All Providers Error:", error);
        res.status(500).json({ message: "Server error while fetching providers." });
    }
};
export const updateProviderStatus = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { status } = req.body;

        if (!['Approved', 'Suspended', 'Pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const [result] = await pool.query(
            'UPDATE provider_profiles SET status = ? WHERE user_id = ?',
            [status, providerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Provider not found.' });
        }

        res.status(200).json({ message: `Provider status updated to ${status}.` });

    } catch (error) {
        console.error("Admin: Update Provider Status Error:", error);
        res.status(500).json({ message: "Server error while updating provider status." });
    }
};

