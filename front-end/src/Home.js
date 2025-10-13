import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Make sure this CSS file is in the same folder

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Local Service Finder and Booking platform</h1>
      <p className="home-subtitle">
        The easiest way to find and book trusted local professionals for any service you need.
      </p>
      <div className="home-buttons-container">
        <Link to="/login">
          {/* Using className to apply styles from Home.css */}
          <button className="home-button login">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="home-button signup">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
