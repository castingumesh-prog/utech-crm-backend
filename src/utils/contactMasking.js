/**
 * Mask mobile number to hide sensitive parts for lower RBAC roles (e.g. Sales Executive, Technician).
 * @param {string} mobile 
 * @returns {string} masked mobile number
 */
function maskContactNumber(mobile) {
  if (!mobile) return '';
  const cleaned = mobile.trim();
  if (cleaned.length <= 4) {
    return '****';
  }
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
}

/**
 * Mask email to hide sensitive parts.
 * @param {string} email 
 * @returns {string} masked email
 */
function maskEmail(email) {
  if (!email) return '';
  const cleaned = email.trim();
  const parts = cleaned.split('@');
  if (parts.length !== 2) {
    return '****';
  }
  const [username, domain] = parts;
  if (username.length <= 2) {
    return `**@${domain}`;
  }
  return `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`;
}

/**
 * Automatically mask mobile/email on an entity object if the user role is not allowed to see them.
 * Allowed roles: Super Admin, Admin, Sales Manager
 * @param {object} entity - Entity object (Lead, Customer, User etc)
 * @param {string} userRole - Role of the requesting user
 * @returns {object} Entity with masked values if role is restricted
 */
function maskEntityContacts(entity, userRole) {
  if (!entity) return entity;
  const allowedRoles = ['Super Admin', 'Admin', 'Sales Manager'];
  if (allowedRoles.includes(userRole)) {
    return entity;
  }

  // Create a copy of the object
  const clone = { ...entity };
  if (clone.mobile) {
    clone.mobile = maskContactNumber(clone.mobile);
  }
  if (clone.email) {
    clone.email = maskEmail(clone.email);
  }
  return clone;
}

/**
 * Automatically mask list of entities.
 * @param {Array} list 
 * @param {string} userRole 
 * @returns {Array} List of entities with masked values
 */
function maskListContacts(list, userRole) {
  if (!Array.isArray(list)) return list;
  const allowedRoles = ['Super Admin', 'Admin', 'Sales Manager'];
  if (allowedRoles.includes(userRole)) {
    return list;
  }
  return list.map(item => maskEntityContacts(item, userRole));
}

module.exports = {
  maskContactNumber,
  maskEmail,
  maskEntityContacts,
  maskListContacts,
};
