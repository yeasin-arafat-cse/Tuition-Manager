import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ১. টোকেন চেক করার মিডলওয়্যার (Protect)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      // 👈 নতুন: ইউজার ব্লকড কিনা চেক করা
      if (user.status === "blocked") {
        return res.status(403).json({ 
          success: false, 
          message: "Your account has been blocked by the Admin." 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

// ২. রোল চেক করার মিডলওয়্যার (Role Based Access)
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`,
      });
    }
    next();
  };
};