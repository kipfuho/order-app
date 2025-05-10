const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));
const allRoleRights = Object.values(allRoles).flat();

module.exports = {
  ROLES,
  roles,
  roleRights,
  allRoleRights,
};
