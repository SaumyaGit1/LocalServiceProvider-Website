import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    // In a real app, you might decode the token to get the email, but this is simpler.
    const userEmail = localStorage.getItem('userEmail');

    const handleLogout = () => {
        // Clear all session data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        // Redirect to the home page
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <Link to="/dashboard" className="logo">
                    QuickServe
                </Link>
                <div className="user-menu">
                    {userEmail && <span className="user-email">{userEmail}</span>}
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
