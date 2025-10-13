import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header'; // NEW: Import the Header
import './CustomerDashboard.css';

// ... (StarRatingDisplay and SearchIcon components remain the same)
const StarRatingDisplay = ({ rating }) => {
    const totalStars = 5;
    const fullStars = Math.round(rating);
    return (
        <div className="star-display">
            {[...Array(totalStars)].map((_, index) => (
                <span key={index} className={index < fullStars ? 'star filled' : 'star'}>
                    &#9733;
                </span>
            ))}
            {rating > 0 && <span>{parseFloat(rating).toFixed(1)}</span>}
        </div>
    );
};
const SearchIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );


const CustomerDashboard = ({ user }) => {
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ search: '', category: '', location: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // ... (useEffect and handleFilterChange logic remains the same)
     useEffect(() => {
        const fetchListings = async () => {
            try {
                const query = new URLSearchParams(filters).toString();
                const res = await fetch(`http://localhost:5000/api/listings?${query}`);
                if (!res.ok) throw new Error('Failed to load services. Please try again later.');
                const data = await res.json();
                setListings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [filters]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/profile/categories');
                if (!res.ok) throw new Error('Could not load categories.');
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchCategories();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <Header /> {/* NEW: Add the universal header */}
            <div className="customer-dashboard">
                <header className="dashboard-header">
                    <div className="dashboard-nav">
                        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Find Services</Link>
                        <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>My Bookings</Link>
                    </div>
                    <h1>Find the Perfect Service</h1>
                    <p>Search for top-rated local professionals for any task.</p>
                </header>
                {/* ... (rest of the component JSX) ... */}
                 <div className="filters-container">
                    <div className="filter-item search-bar">
                        <SearchIcon />
                        <input type="text" name="search" placeholder="Search by service or provider..." value={filters.search} onChange={handleFilterChange} />
                    </div>
                    <select name="category" className="filter-item" value={filters.category} onChange={handleFilterChange}>
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <input type="text" name="location" className="filter-item" placeholder="Filter by location (e.g., city)" value={filters.location} onChange={handleFilterChange} />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="listings-grid">
                    {loading ? <p className="loading-message">Loading services...</p> : listings.length > 0 ? (
                        listings.map(listing => (
                            <div key={listing.id} className="listing-card">
                                <div className="card-content">
                                    <span className="card-category">{listing.category_name}</span>
                                    <h3 className="card-title">{listing.title}</h3>
                                    <p className="card-provider">by {listing.provider_name}</p>
                                    <StarRatingDisplay rating={listing.average_rating} />
                                    <p className="card-description">{listing.description}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="card-price">${listing.price}</span>
                                    <Link to={`/book/${listing.id}`} className="btn-book-now">
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : <p className="no-items-message">No services found matching your criteria.</p>}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;

