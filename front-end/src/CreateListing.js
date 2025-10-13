import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateListing.css';

const CreateListing = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category_id: ''
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/profile/categories');
                const data = await res.json();
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, category_id: data[0].id }));
                }
            } catch (err) {
                setError('Failed to load service categories.');
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/listings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create listing.');
            }
            
            navigate('/dashboard'); // Redirect to dashboard on success
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="create-listing-container">
            <div className="create-listing-card">
                <h1 className="create-listing-title">Add a New Service</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Service Title</label>
                        <input type="text" id="title" name="title" required className="form-input" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" name="description" rows="4" className="form-input" onChange={handleChange}></textarea>
                    </div>
                     <div className="form-group">
                        <label htmlFor="price">Price ($)</label>
                        <input type="number" id="price" name="price" required min="0" step="0.01" className="form-input" onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category_id">Category</label>
                        <select id="category_id" name="category_id" required className="form-input" value={formData.category_id} onChange={handleChange}>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="form-button">Create Service</button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default CreateListing;
