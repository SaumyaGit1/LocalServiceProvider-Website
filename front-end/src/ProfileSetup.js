import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileSetup.css'; // Ensure you have the corresponding CSS file

const ProfileSetup = () => {
    // State for text inputs
    const [formData, setFormData] = useState({
        name: '',
        location: '',
    });
    // State for the list of available categories from the DB
    const [allCategories, setAllCategories] = useState([]);
    // State for the IDs of the categories the user has checked
    const [selectedCategories, setSelectedCategories] = useState([]);
    
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- Fetch all available service categories when the component loads ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/profile/categories');
                if (!res.ok) throw new Error('Could not fetch categories');
                const data = await res.json();
                setAllCategories(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchCategories();
    }, []);

    // --- Handler for text input changes (name, location) ---
    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Handler for checkbox changes ---
    const handleCategoryChange = (categoryId) => {
        // Check if the category is already selected
        if (selectedCategories.includes(categoryId)) {
            // If yes, remove it (uncheck)
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            // If no, add it (check)
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    // --- Handler for form submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Construct the payload to send to the backend
        const profileData = {
            name: formData.name,
            location: formData.location,
            categories: selectedCategories, // This will be an array of IDs, e.g., [2, 3, 5]
        };

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/profile/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            const data = await res.json();
            if (!res.ok) {
                // If the server responds with an error, display it
                throw new Error(data.message || 'Failed to save profile.');
            }

            // On success, redirect to the main dashboard
            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="profile-setup-container">
            <div className="profile-setup-card">
                <h1 className="profile-setup-title">Complete Your Profile</h1>
                <p className="profile-setup-subtitle">Tell us more about your business to get started.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name or Business Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleTextChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location (e.g., City, ZIP Code)</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            className="form-input"
                            value={formData.location}
                            onChange={handleTextChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Your Service Categories</label>
                        <div className="categories-grid">
                            {allCategories.map(category => (
                                <div key={category.id} className="category-item">
                                    <input
                                        type="checkbox"
                                        id={`category-${category.id}`}
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                    />
                                    <label htmlFor={`category-${category.id}`}>{category.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="form-button">Save and Continue</button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;

