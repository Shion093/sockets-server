const _ = require('lodash');

function checkRole (roles, userRole) {
  return _.find(roles, (r) => r === userRole);
}

function hasAccess (permit) {
  return (req, res, next) => {
    const hasRole = checkRole(permit, req.user.role);
    if (req.user && hasRole) {
      next();
    } else {
      return res.status(403).json({message : 'Forbidden'});
    }
  }
}

module.exports = {
  hasAccess,
};