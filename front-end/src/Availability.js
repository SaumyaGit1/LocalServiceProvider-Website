import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Availability.css';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const initialTime = '09:00';
const finalTime = '17:00';

const Availability = () => {
    const [availability, setAvailability] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAvailability = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return navigate('/login');

            const res = await fetch('http://localhost:5000/api/bookings/availability', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load your availability.');
            
            const data = await res.json();
            const formattedData = daysOfWeek.map(day => {
                const existing = data.find(d => d.day_of_week === day);
                return {
                    day_of_week: day,
                    start_time: existing ? existing.start_time.slice(0, 5) : initialTime,
                    end_time: existing ? existing.end_time.slice(0, 5) : finalTime,
                    isEnabled: !!existing
                };
            });
            setAvailability(formattedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const handleTimeChange = (day, field, value) => {
        setAvailability(prev => prev.map(d => 
            d.day_of_week === day ? { ...d, [field]: value } : d
        ));
    };

    const handleToggle = (day) => {
        setAvailability(prev => prev.map(d => 
            d.day_of_week === day ? { ...d, isEnabled: !d.isEnabled } : d
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        const payload = availability
            .filter(d => d.isEnabled)
            .map(({ day_of_week, start_time, end_time }) => ({ day_of_week, start_time, end_time }));

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/bookings/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ availability: payload })
            });
            if (!res.ok) throw new Error('Failed to save availability.');
            setSuccess('Your availability has been saved successfully!');
        } catch (err) {
            setError(err.message);
        }
    };
    
    if (loading) return <div className="loading-message">Loading Your Schedule...</div>;

    return (
        <div className="availability-container">
            <div className="availability-card">
                <div className="availability-header">
                    <h2>Manage Your Weekly Availability</h2>
                    <p>Set the hours you are available. Customers will only be able to book you during these times.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="availability-table">
                        {availability.map(({ day_of_week, start_time, end_time, isEnabled }) => (
                            <div key={day_of_week} className={`day-row ${isEnabled ? '' : 'disabled'}`}>
                                <div className="day-toggle">
                                    <input type="checkbox" id={`check-${day_of_week}`} checked={isEnabled} onChange={() => handleToggle(day_of_week)} />
                                    <label htmlFor={`check-${day_of_week}`}>{day_of_week}</label>
                                </div>
                                <div className="time-inputs">
                                    <input type="time" value={start_time} disabled={!isEnabled} onChange={(e) => handleTimeChange(day_of_week, 'start_time', e.target.value)} />
                                    <span>to</span>
                                    <input type="time" value={end_time} disabled={!isEnabled} onChange={(e) => handleTimeChange(day_of_week, 'end_time', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="form-button">Save Availability</button>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                </form>
            </div>
        </div>
    );
};

export default Availability;

