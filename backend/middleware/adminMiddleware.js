// This middleware is designed to run AFTER the main authMiddleware.
// It checks if the user attached to the request has admin privileges.

const adminMiddleware = (req, res, next) => {
    // req.user is attached by the preceding authMiddleware and contains the 'is_admin' flag
    if (req.user && req.user.is_admin) {
        next(); // User is an admin, proceed to the next function (the controller)
    } else {
        // If the user is not an admin, deny access with a 403 Forbidden error
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

export default adminMiddleware;

