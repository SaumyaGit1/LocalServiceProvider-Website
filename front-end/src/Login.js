import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to login');
            
            localStorage.setItem('authToken', data.token);
            
            // --- NEW: Smart redirection based on admin status ---
            const { role, isProfileComplete, is_admin } = data.user;

            if (is_admin) {
                navigate('/admin'); // Admins go directly to the admin panel
            } else if (role === 'Service Provider' && !isProfileComplete) {
                navigate('/profile-setup');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back!</h1>
                <p className="auth-subtitle">Sign in to continue your journey with us.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input id="email" type="email" placeholder="you@example.com" className="form-input" required onChange={handleChange} value={formData.email} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input id="password" type="password" placeholder="••••••••" className="form-input" required onChange={handleChange} value={formData.password}/>
                    </div>
                    <button type="submit" className="form-button">Login</button>
                    {error && <p className="error-message">{error}</p>}
                </form>
                <p className="bottom-text">Don't have an account? <Link to="/signup" className="bottom-link">Sign Up</Link></p>
            </div>
        </div>
    );
}

