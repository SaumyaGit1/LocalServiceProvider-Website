import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LeaveReview.css';

// Star rating component
const StarRating = ({ rating, setRating }) => {
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span
                        key={starValue}
                        className={starValue <= rating ? 'star filled' : 'star'}
                        onClick={() => setRating(starValue)}
                    >
                        &#9733;
                    </span>
                );
            })}
        </div>
    );
};

const LeaveReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { booking } = location.state || {};

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    if (!booking) {
        return <div className="loading-message">No booking information provided. Please go back to your bookings.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setError('Please select a star rating.');
        
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: booking.id,
                    listing_id: booking.listing_id,
                    rating,
                    comment
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to submit review.');
            }
            
            alert('Review submitted successfully!');
            navigate('/my-bookings');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="review-page-container">
            <div className="review-card">
                <div className="review-header">
                    <h2>Leave a Review</h2>
                    <p>Share your experience for the service: <strong>{booking.service_title}</strong></p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Rating</label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">Your Comments (Optional)</label>
                        <textarea
                            id="comment"
                            rows="5"
                            className="form-input"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience..."
                        ></textarea>
                    </div>
                    <button type="submit" className="form-button">Submit Review</button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default LeaveReview;
