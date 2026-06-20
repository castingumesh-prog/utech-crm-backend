/**
 * Express middleware to guard bulk exports of leads, customers, or reports.
 * Restricts bulk exports to Super Admin, Admin, and Sales Manager roles.
 */
function exportGuard(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
  }

  const { role } = req.user;
  const allowedRoles = ['Super Admin', 'Admin', 'Sales Manager'];

  if (allowedRoles.includes(role)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden: You do not have permission to export or download bulk data',
  });
}

module.exports = exportGuard;
