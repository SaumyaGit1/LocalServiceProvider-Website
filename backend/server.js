import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

// --- Import All Route Files ---
import authRoutes from './routes/authRoute.js';
import profileRoutes from './routes/profileRoute.js';
import listingRoutes from './routes/listingRoute.js';
import bookingRoutes from './routes/bookingRoute.js';
import reviewRoutes from './routes/reviewRoute.js';
import adminRoutes from './routes/adminRoute.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Route Registration ---
// This is the key section. We are telling the server how to handle
// requests for each part of the API.
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/listings', listingRoutes); // This line ensures /api/listings/create will work
app.use('/api/bookings',bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});

