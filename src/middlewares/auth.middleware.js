import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    console.warn(`[AUTH] Unauthorized access attempt by user: ${req.user.id} with role: ${req.user.role}`);
    return res.status(403).json({
      message: "Access denied"
    });
  }

  console.log(`[AUTH] Admin authorized: ${req.user.id}`);
  next();
};