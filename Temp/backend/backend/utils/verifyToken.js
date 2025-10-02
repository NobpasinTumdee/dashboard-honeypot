import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const secretKey = process.env.JWT_SECRET ;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // ส่งข้อมูลผู้ใช้ที่ decode แล้วไปใช้งานต่อ
    // console.log(req.user);
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};