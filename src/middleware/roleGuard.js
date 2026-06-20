/**
 * Express middleware to restrict access to endpoints based on user roles.
 * Roles: Super Admin, Admin, Sales Manager, Sales Executive, Technician
 * @param {Array<string>} allowedRoles - List of roles permitted to access the route
 */
function roleGuard(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }

    const { role } = req.user;
    
    // Super Admin has access to all routes by default
    if (role === 'Super Admin') {
      return next();
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to access this resource' });
  };
}

module.exports = roleGuard;
