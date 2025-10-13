import pool from '../db.js';

/**
 * Fetches all service categories from the database.
 */
export const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM service_categories ORDER BY name');
        res.status(200).json(categories);
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ message: "Server error while fetching categories." });
    }
};

/**
 * Saves or updates the profile information for a service provider using a database transaction.
 */
export const saveProfile = async (req, res) => {
    const connection = await pool.getConnection(); 

    try {
        const userId = req.user.id;
        const { name, location, categories } = req.body;

        if (!name || !location || !categories || !Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({ message: "Name, location, and at least one category are required." });
        }

        await connection.beginTransaction();

        await connection.query(
            'INSERT INTO provider_profiles (user_id, name, location) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, location = ?',
            [userId, name, location, name, location]
        );

        // This query now correctly uses user_id
        await connection.query('DELETE FROM provider_categories WHERE user_id = ?', [userId]);

        const categoryValues = categories.map(categoryId => [userId, categoryId]);
        // This query also now correctly uses user_id
        await connection.query('INSERT INTO provider_categories (user_id, category_id) VALUES ?', [categoryValues]);
        
        await connection.commit();
        
        res.status(201).json({ message: 'Profile saved successfully!' });

    } catch (error) {
        await connection.rollback();
        console.error("Save Profile Transaction Error:", error); 
        res.status(500).json({ message: "Server error while saving profile." });
    } finally {
        connection.release();
    }
};

