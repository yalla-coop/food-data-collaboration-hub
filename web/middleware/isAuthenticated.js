const isAuthenticated = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
      isAuthenticated: false,
    });
  }
  return next();
};

export default isAuthenticated;
