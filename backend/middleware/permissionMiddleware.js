export const checkPermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.role.permissions;

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
