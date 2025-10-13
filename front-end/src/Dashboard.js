import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard'; 

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        // This function handles logging out the user
        const handleLogout = () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
            navigate('/');
        };
        
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                handleLogout(); // Token is expired
            } else {
                setUser(decodedToken);
            }
        } catch (error) {
            console.error("Invalid token:", error);
            handleLogout(); // Token is invalid
        } finally {
            setLoading(false);
        }
    }, [navigate]); // The dependency array is correct now

    if (loading) {
        return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading Dashboard...</div>;
    }

    if (user) {
        switch (user.role) {
            case 'Customer':
                return <CustomerDashboard user={user} />;
            case 'Service Provider':
                return <ProviderDashboard user={user} />;
            default:
                return <div>Unknown role. Please contact support.</div>;
        }
    }

    return null; 
};

export default Dashboard;

