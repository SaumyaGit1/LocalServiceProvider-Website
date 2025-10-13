import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header'; // NEW: Import the universal Header component
import './ProviderDashboard.css';

const ProviderDashboard = ({ user }) => {
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return navigate('/login');

            const [listingsRes, bookingsRes] = await Promise.all([
                fetch('http://localhost:5000/api/listings/my-listings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/bookings/my-bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!listingsRes.ok) throw new Error('Failed to fetch your services.');
            if (!bookingsRes.ok) throw new Error('Failed to fetch your bookings.');

            const listingsData = await listingsRes.json();
            const bookingsData = await bookingsRes.json();

            setListings(listingsData);
            setBookings(bookingsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        // ... (existing code)
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData(); // Refresh all data
        } catch (err) { setError(err.message); }
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });

    const pendingBookings = bookings.filter(b => b.status === 'Pending');

    if (loading) return <div className="loading-message">Loading Dashboard...</div>;

    return (
        <div>
            <Header /> {/* FIXED: The universal header with the logout button is now included. */}
            <div className="provider-dashboard-container">
                <div className="provider-dashboard-card">
                    <header className="provider-header">
                        <h1>Provider Dashboard</h1>
                        <div className="dashboard-nav">
                            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
                            <Link to="/availability" className="nav-link">My Availability</Link>
                            <Link to="/my-bookings" className="nav-link">All Bookings</Link>
                        </div>
                    </header>

                    {error && <div className="error-message">{error}</div>}

                    {/* --- Incoming Bookings Section --- */}
                    <div className="dashboard-section">
                        <h2 className="section-title">
                            New Booking Requests
                            {pendingBookings.length > 0 && <span className="notification-badge">{pendingBookings.length}</span>}
                        </h2>
                        {pendingBookings.length > 0 ? (
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Customer</th>
                                        <th>Date & Time</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingBookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>{booking.service_title}</td>
                                            <td>{booking.customer_email}</td>
                                            <td>{formatDate(booking.booking_time)}</td>
                                            <td className="action-buttons">
                                                <button className="btn-action btn-confirm" onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}>Confirm</button>
                                                <button className="btn-action btn-cancel" onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>Cancel</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-items-message">You have no new booking requests.</p>
                        )}
                    </div>

                    {/* --- My Services Section --- */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2 className="section-title">Your Service Listings</h2>
                            <Link to="/create-listing" className="btn-create-listing">+ Add New Service</Link>
                        </div>
                        {listings.length > 0 ? (
                            <table className="listings-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map(listing => (
                                    <tr key={listing.id}>
                                        <td>{listing.title}</td>
                                        <td>{listing.category_name}</td>
                                        <td>${listing.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        ) : (
                            <p className="no-items-message">You haven't created any services yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;

