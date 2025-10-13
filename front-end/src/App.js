import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Signup from './Signup';
import Login from './Login';
import Dashboard from './Dashboard';
import ProfileSetup from './ProfileSetup';
import CreateListing from './CreateListing'; 
import Availability from './Availability';
import BookingPage from './BookingPage';
import MyBookings from './MyBooking';
import LeaveReview from './LeaveReview';
import AdminDashboard from './AdminDashboard'; // NEW

import './App.css';
import './Auth.css';
import './Dashboard.css';
import './ProfileSetup.css';
import './Home.css';
import './CustomerDashboard.css';
import './ProviderDashboard.css';
import './CreateListing.css';
import './Availability.css';
import './BookingPage.css';
import './MyBooking.css';
import './LeaveReview.css';
import './AdminDashboard.css'; // NEW

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/book/:listingId" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/leave-review" element={<LeaveReview />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* NEW */}
      </Routes>
    </Router>
  );
}

export default App;

