import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './MyBooking.css';

const MyBooking= () => {
    const [bookings, setBookings] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return navigate('/login');
            
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role);

            const res = await fetch('http://localhost:5000/api/bookings/my-bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load your bookings.');
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        // ... (existing code for providers)
        const originalBookings = [...bookings];
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                setBookings(originalBookings);
                throw new Error(`Failed to update booking status.`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
    
    // --- CORRECTED Customer View with working "Leave a Review" button ---
    const renderCustomerView = () => (
        <table className="bookings-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Provider</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map(booking => (
                    <tr key={booking.id}>
                        <td>{booking.service_title}</td>
                        <td>{booking.provider_name}</td>
                        <td>{formatDate(booking.booking_time)}</td>
                        <td><span className={`status-badge status-${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                        <td className="action-buttons" style={{ justifyContent: 'center' }}>
                            {booking.status === 'Completed' && (
                                <Link 
                                    to="/leave-review" 
                                    state={{ booking: booking }} // Pass all booking data
                                    className="btn-action btn-review"
                                >
                                    Leave a Review
                                </Link>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

     const renderProviderView = () => (
         <table className="bookings-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map(booking => (
                    <tr key={booking.id}>
                        <td>{booking.service_title}</td>
                        <td>{booking.customer_email}</td>
                        <td>{formatDate(booking.booking_time)}</td>
                        <td><span className={`status-badge status-${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                        <td className="action-buttons">
                            {booking.status === 'Pending' && (
                                <>
                                    <button className="btn-action btn-confirm" onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}>Confirm</button>
                                    <button className="btn-action btn-cancel" onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}>Cancel</button>
                                </>
                            )}
                             {booking.status === 'Confirmed' && (
                                <button className="btn-action btn-complete" onClick={() => handleStatusUpdate(booking.id, 'Completed')}>Mark as Complete</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="my-bookings-container">
            <div className="my-bookings-card">
                 <header className="my-bookings-header">
                    <h1>My Bookings</h1>
                    <div className="dashboard-nav">
                        {userRole === 'Customer' ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Find Services</Link>
                                <Link to="/my-bookings" className="nav-link active">My Bookings</Link>
                            </>
                        ) : (
                             <>
                                <Link to="/dashboard" className="nav-link">My Services</Link>
                                <Link to="/availability" className="nav-link">My Availability</Link>
                                <Link to="/my-bookings" className="nav-link active">My Bookings</Link>
                            </>
                        )}
                    </div>
                </header>
                
                {loading && <p className="loading-message">Loading your bookings...</p>}
                {error && <p className="error-message">{error}</p>}
                
                {!loading && !error && bookings.length === 0 && (
                    <p className="no-bookings-message">You don't have any bookings yet.</p>
                )}

                {!loading && !error && bookings.length > 0 && (
                    userRole === 'Customer' ? renderCustomerView() : renderProviderView()
                )}
            </div>
        </div>
    );
};

export default MyBooking;

