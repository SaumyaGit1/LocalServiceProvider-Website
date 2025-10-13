QuickServe: Local Service Discovery & Booking Platform
QuickServe is a full-stack web application designed to bridge the gap between local service providers and customers. It provides a seamless, end-to-end experience for finding, booking, and managing local services, complete with a powerful admin panel for platform oversight.

(You can replace the above URL with a screenshot of your application)

Features
This application is built with a role-based architecture, providing a tailored experience for three distinct user types:

👤 Customer Features
Service Discovery: Search and filter for local service providers by keyword, category, and location.

View Ratings & Reviews: See average star ratings on the main dashboard and read detailed comments on the booking page.

Real-Time Booking: View a provider's real-time availability and book an appointment.

Booking Management: A dedicated "My Bookings" page to track the status of all appointments.

Leave Feedback: After a service is completed, customers can leave a 1-5 star rating and a written review.

🛠️ Service Provider Features
Profile Management: An onboarding flow to create a professional profile with name, location, and service specializations.

Service Listing Management: A full dashboard to create, view, and manage their service listings.

Availability Control: An interface to set and update weekly availability.

Booking Management: An interactive dashboard to Confirm, Cancel, or Mark as Complete any booking.

🔐 Admin Features
Secure Dashboard: A protected admin panel accessible only to administrators.

Platform Analytics: A high-level overview of key metrics like total users, active providers, and top categories.

Provider Moderation: A moderation table to Approve, Suspend, or Re-Approve service providers.

Full User Management: A master list of all users with the ability to Suspend or Re-activate any account.

Tech Stack
Frontend: React.js, React Router

Backend: Node.js, Express.js

Database: MySQL

Authentication: JSON Web Tokens (JWT), bcryptjs for password hashing

Project Setup
To run this project locally, you will need to set up both the backend server and the frontend application.

1. Backend Setup
Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Set up your environment variables:

Create a file named .env in the backend directory.

IMPORTANT: This file contains sensitive information and is ignored by Git (via the .gitignore file). It should never be committed to a public repository.

Add the following variables, replacing the placeholders with your actual credentials:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kce
JWT_SECRET=your_super_secret_jwt_key

Set up the database:

Open MySQL Workbench and create a new schema named kce.

Run the complete SQL script located in your project to create all the necessary tables.

Start the server:

npm start

The server will be running on http://localhost:5000.

2. Frontend Setup
Open a new terminal and navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the application:

npm start

The React application will open in your browser, usually at http://localhost:3000.

3. Creating an Admin User (Required for Admin Panel Access)
Sign up normally through the application's UI with an email you want to designate for admin use.

Manually grant admin privileges by running the following command in MySQL Workbench. Replace the email with the one you just used.

UPDATE users SET is_admin = 1 WHERE email = 'your-admin-email@example.com';

Log out of the application and then log back in with the admin account to access the /admin panel.