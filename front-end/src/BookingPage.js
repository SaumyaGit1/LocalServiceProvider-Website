import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingPage.css';
import './Reviews.css'; // Import the new stylesheet for reviews

// --- Reusable Star Rating Display Component ---
const StarRatingDisplay = ({ rating }) => {
    const totalStars = 5;
    const fullStars = Math.round(rating);
    return (
        <div className="star-display">
            {[...Array(totalStars)].map((_, index) => (
                <span key={index} className={index < fullStars ? 'star filled' : 'star'}>&#9733;</span>
            ))}
            {rating > 0 && <span>{parseFloat(rating).toFixed(1)}</span>}
        </div>
    );
};

const BookingPage = () => {
    // ... (existing state and logic)
    const { listingId } = useParams();
    const [listing, setListing] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListingDetails = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/listings/${listingId}`);
                if (!res.ok) throw new Error('Could not find this service listing.');
                const data = await res.json();
                setListing(data);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchListingDetails();
    }, [listingId]);
    
    // ... (rest of the component logic remains the same)
     useEffect(() => {
        if (listing && listing.provider_id) {
            const fetchSlots = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/bookings/slots/${listing.provider_id}`);
                    if (!res.ok) throw new Error('Failed to fetch available slots for this provider.');
                    const data = await res.json();
                    setSlots(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchSlots();
        }
    }, [listing]);

    const handleBooking = async () => {
        if (!selectedSlot) return setError("Please select a time slot to continue.");
        
        const token = localStorage.getItem('authToken');
        if (!token) return navigate('/login');

        try {
            const res = await fetch('http://localhost:5000/api/bookings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    provider_id: listing.provider_id,
                    listing_id: parseInt(listingId, 10),
                    booking_time: selectedSlot
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create booking.');
            }
            
            alert('Booking successful! The provider has been notified.');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };
    
    const groupedSlots = useMemo(() => slots.reduce((acc, slot) => {
        const date = new Date(slot).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(slot);
        return acc;
    }, {}), [slots]);

    const formatDateHeader = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (loading) return <div className="loading-message">Loading booking calendar...</div>;

    return (
        <div className="booking-page-container">
            <div className="booking-card">
                {listing && (
                    <div className="booking-header">
                        <h2>Book: {listing.title}</h2>
                        <p>with {listing.provider_name}</p>
                    </div>
                )}
                {/* ... (slots container) */}
                 <div className="slots-container">
                    {Object.keys(groupedSlots).length > 0 ? (
                        Object.entries(groupedSlots).map(([date, timeSlots]) => (
                            <div key={date} className="date-group">
                                <h3>{formatDateHeader(date)}</h3>
                                <div className="time-slots-grid">
                                    {timeSlots.map(slot => (
                                        <button 
                                            key={slot} 
                                            className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            {formatTime(slot)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-slots-message">No available slots in the next 7 days for this provider.</p>
                    )}
                </div>
                {error && <p className="error-message">{error}</p>}
                <button className="form-button" onClick={handleBooking} disabled={!selectedSlot}>
                    Confirm Booking
                </button>
            </div>
            
            {/* --- NEW: Reviews Section --- */}
            {listing && listing.reviews && (
                <div className="reviews-section">
                    <h2>What Customers Are Saying</h2>
                    {listing.reviews.length > 0 ? (
                        listing.reviews.map((review, index) => (
                            <div key={index} className="review-item">
                                <StarRatingDisplay rating={review.rating} />
                                <p className="review-comment">"{review.comment}"</p>
                                <span className="review-author">- {review.customer_email.split('@')[0]}</span>
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet for this service.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingPage;

