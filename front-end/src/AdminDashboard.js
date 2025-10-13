import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'; // NEW: Import the Header
import './AdminDashboard.css';

const AdminDashboard = () => {
    // ... (existing logic)
    const [view, setView] = useState('analytics'); // 'analytics', 'providers', or 'users'
    const [data, setData] = useState({ analytics: null, providers: [], users: [] });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return navigate('/login');

            const [analyticsRes, providersRes, usersRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/admin/providers', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (analyticsRes.status === 403) throw new Error('Access Denied. You are not an administrator.');
            
            const analyticsData = await analyticsRes.json();
            const providersData = await providersRes.json();
            const usersData = await usersRes.json();

            setData({ analytics: analyticsData, providers: providersData, users: usersData });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProviderStatusChange = async (providerId, newStatus) => {
        // ... (existing code)
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:5000/api/admin/providers/${providerId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData();
        } catch (err) { setError(err.message); }
    };
    
    const handleUserStatusChange = async (userId, newStatus) => {
        // ... (existing code)
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
            fetchData();
        } catch (err) { setError(err.message); }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    if (loading) return <div className="loading-message">Loading Admin Panel...</div>;

    const renderView = () => {
        // ... (existing renderView logic)
         switch (view) {
            case 'analytics':
                return data.analytics && (
                    <div className="analytics-grid">
                        <div className="stat-card"><h3>Total Users</h3><p>{data.analytics.totalUsers}</p></div>
                        <div className="stat-card"><h3>Approved Providers</h3><p>{data.analytics.totalProviders}</p></div>
                        <div className="stat-card"><h3>Total Bookings</h3><p>{data.analytics.totalBookings}</p></div>
                        <div className="stat-card top-categories">
                            <h3>Top Categories</h3>
                            <ul>
                                {data.analytics.topCategories.map(cat => <li key={cat.name}><span>{cat.name}</span><strong>{cat.bookingCount}</strong></li>)}
                            </ul>
                        </div>
                    </div>
                );
            case 'providers':
                return (
                    <table className="admin-table">
                        <thead><tr><th>Provider Name</th><th>Email</th><th>Location</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th></tr></thead>
                        <tbody>
                            {data.providers.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td><td>{p.email}</td><td>{p.location}</td>
                                    <td><span className={`status-badge status-${p.status.toLowerCase()}`}>{p.status}</span></td>
                                    <td className="action-buttons">
                                        {p.status === 'Pending' && <button className="btn-action btn-approve" onClick={() => handleProviderStatusChange(p.id, 'Approved')}>Approve</button>}
                                        {p.status === 'Approved' && <button className="btn-action btn-suspend" onClick={() => handleProviderStatusChange(p.id, 'Suspended')}>Suspend</button>}
                                        {p.status === 'Suspended' && <button className="btn-action btn-approve" onClick={() => handleProviderStatusChange(p.id, 'Approved')}>Re-Approve</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'users':
                 return (
                    <table className="admin-table">
                        <thead><tr><th>User Email</th><th>Role</th><th>Registered On</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th></tr></thead>
                        <tbody>
                            {data.users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.email}</td><td>{u.role}</td><td>{formatDate(u.created_at)}</td>
                                    <td><span className={`status-badge user-status-${u.status.toLowerCase()}`}>{u.status}</span></td>
                                    <td className="action-buttons">
                                        {u.status === 'Active' ? 
                                            <button className="btn-action btn-suspend" onClick={() => handleUserStatusChange(u.id, 'Suspended')}>Suspend</button> :
                                            <button className="btn-action btn-approve" onClick={() => handleUserStatusChange(u.id, 'Active')}>Re-Activate</button>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default: return null;
        }
    };


    return (
        <div>
            <Header /> {/* NEW: Add the universal header */}
            <div className="admin-dashboard-container">
                <div className="admin-dashboard-card">
                    <header className="admin-header">
                        <h1>Admin Dashboard</h1>
                        <div className="dashboard-nav">
                            <button className={`nav-link ${view === 'analytics' ? 'active' : ''}`} onClick={() => setView('analytics')}>Analytics</button>
                            <button className={`nav-link ${view === 'providers' ? 'active' : ''}`} onClick={() => setView('providers')}>Provider Moderation</button>
                            <button className={`nav-link ${view === 'users' ? 'active' : ''}`} onClick={() => setView('users')}>User Management</button>
                        </div>
                    </header>
                    {error && <div className="error-message">{error}</div>}
                    <div className="admin-content">
                        {renderView()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

