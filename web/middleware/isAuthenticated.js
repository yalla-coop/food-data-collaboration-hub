
const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        isAuthenticated: false,
      });
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default isAuthenticated;
