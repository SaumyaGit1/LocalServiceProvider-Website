import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

// --- Helper SVG Icon Components ---
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> );
const BriefcaseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> );

export default function Signup() {
    const [role, setRole] = useState('Service Provider');
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match!");
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password, role }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to register');
            }
            
            // 1. Show a success message
            setSuccess('Registration successful! Redirecting to login...');

            // 2. Redirect to the login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000); // 2-second delay

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Create Account</h1>
                <p className="auth-subtitle">Join our community of local services</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input id="email" type="email" placeholder="you@example.com" className="form-input" required onChange={handleChange} value={formData.email} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input id="password" type="password" placeholder="••••••••" className="form-input" required onChange={handleChange} value={formData.password} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input id="confirmPassword" type="password" placeholder="••••••••" className="form-input" required onChange={handleChange} value={formData.confirmPassword} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Choose your role</label>
                        <div className="role-selector-grid">
                            <button type="button" onClick={() => setRole('Service Provider')} className={`role-button ${role === 'Service Provider' ? 'active' : 'inactive'}`}><BriefcaseIcon /> Provider</button>
                            <button type="button" onClick={() => setRole('Customer')} className={`role-button ${role === 'Customer' ? 'active' : 'inactive'}`}><UserIcon /> Customer</button>
                        </div>
                    </div>
                    <button type="submit" className="form-button">Sign Up</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <p className="bottom-text">Already have an account? <Link to="/login" className="bottom-link">Sign In</Link></p>
            </div>
        </div>
    );
}

