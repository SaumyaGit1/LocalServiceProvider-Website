import pool from '../db.js';

// --- (Existing functions: setAvailability, getAvailability, etc. remain the same) ---

// --- CORRECTED: Get all bookings for the logged-in user ---
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query;
        if (userRole === 'Customer') {
            // FIXED: This query now includes 'b.listing_id', which is essential for the review feature.
            query = `
                SELECT 
                    b.id, b.listing_id, b.booking_time, b.status,
                    sl.title AS service_title,
                    pp.name AS provider_name
                FROM bookings b
                JOIN service_listings sl ON b.listing_id = sl.id
                JOIN provider_profiles pp ON b.provider_id = pp.user_id
                WHERE b.customer_id = ?
                ORDER BY b.booking_time DESC
            `;
        } else if (userRole === 'Service Provider') {
            query = `
                SELECT 
                    b.id, b.booking_time, b.status,
                    sl.title AS service_title,
                    u.email AS customer_email
                FROM bookings b
                JOIN service_listings sl ON b.listing_id = sl.id
                JOIN users u ON b.customer_id = u.id
                WHERE b.provider_id = ?
                ORDER BY b.booking_time DESC
            `;
        } else {
            return res.status(403).json({ message: "Unknown user role." });
        }

        const [bookings] = await pool.query(query, [userId]);
        res.status(200).json(bookings);

    } catch (error) {
        console.error("Get My Bookings Error:", error);
        res.status(500).json({ message: "Server error while fetching bookings." });
    }
};

// --- (Other functions: updateBookingStatus, createBooking, etc.) ---
export const updateBookingStatus = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!['Confirmed', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const [result] = await pool.query(
            'UPDATE bookings SET status = ? WHERE id = ? AND provider_id = ?',
            [status, bookingId, providerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found or you're not authorized to update it." });
        }

        res.status(200).json({ message: `Booking status updated to ${status}.` });

    } catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({ message: "Server error while updating booking status." });
    }
};
export const setAvailability = async (req, res) => {
    const providerId = req.user.id;
    const { availability } = req.body; 

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM provider_availability WHERE provider_id = ?', [providerId]);
        if (availability && availability.length > 0) {
            const values = availability.map(a => [providerId, a.day_of_week, a.start_time, a.end_time]);
            await connection.query('INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time) VALUES ?', [values]);
        }
        await connection.commit();
        res.status(200).json({ message: 'Availability updated successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error("Set Availability Error:", error);
        res.status(500).json({ message: 'Server error while updating availability.' });
    } finally {
        connection.release();
    }
};
export const getAvailability = async (req, res) => {
    try {
        const providerId = req.user.id;
        const [availability] = await pool.query('SELECT day_of_week, start_time, end_time FROM provider_availability WHERE provider_id = ?', [providerId]);
        res.status(200).json(availability);
    } catch (error) {
        console.error("Get Availability Error:", error);
        res.status(500).json({ message: 'Server error while fetching availability.' });
    }
};
export const getAvailableSlots = async (req, res) => {
    try {
        const { providerId } = req.params;
        if (isNaN(parseInt(providerId, 10))) {
            return res.status(400).json({ message: 'Invalid provider ID.' });
        }

        const [availability] = await pool.query('SELECT day_of_week, start_time, end_time FROM provider_availability WHERE provider_id = ?', [providerId]);
        const [bookings] = await pool.query('SELECT booking_time FROM bookings WHERE provider_id = ? AND status != "Cancelled" AND booking_time >= NOW()', [providerId]);

        const bookedSlots = new Set(bookings.map(b => new Date(b.booking_time).toISOString()));
        const availableSlots = [];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(now);
            currentDay.setDate(now.getDate() + i);
            const dayOfWeekString = days[currentDay.getDay()];
            
            const schedule = availability.find(a => a.day_of_week === dayOfWeekString);

            if (schedule && schedule.start_time && schedule.end_time) {
                const [startHour] = schedule.start_time.split(':').map(Number);
                const [endHour] = schedule.end_time.split(':').map(Number);

                for (let hour = startHour; hour < endHour; hour++) {
                    const slotTime = new Date(currentDay);
                    slotTime.setHours(hour, 0, 0, 0);

                    if (slotTime > now && !bookedSlots.has(slotTime.toISOString())) {
                        availableSlots.push(slotTime.toISOString());
                    }
                }
            }
        }
        res.status(200).json(availableSlots);
    } catch (error) {
        console.error("Get Available Slots Error:", error);
        res.status(500).json({ message: 'Server error while fetching available slots.' });
    }
};
export const createBooking = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { provider_id, listing_id, booking_time } = req.body;

        if (!provider_id || !listing_id || !booking_time) {
            return res.status(400).json({ message: 'Missing booking details.' });
        }
        
        const mysqlBookingTime = new Date(booking_time).toISOString().slice(0, 19).replace('T', ' ');

        const newBooking = { 
            customer_id: customerId, 
            provider_id, 
            listing_id, 
            booking_time: mysqlBookingTime
        };

        await pool.query('INSERT INTO bookings SET ?', newBooking);

        res.status(201).json({ message: 'Booking created successfully!' });
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ message: 'Server error while creating booking.' });
    }
};

