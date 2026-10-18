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
      // "Bearer <token>" থেকে শুধু টোকেনটা নেওয়া
      token = req.headers.authorization.split(" ")[1];

      // টোকেন ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ইউজারকে খুঁজে বের করা (পাসওয়ার্ড ছাড়া)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
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