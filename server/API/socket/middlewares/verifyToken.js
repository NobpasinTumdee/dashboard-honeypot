import jwt from 'jsonwebtoken';

// const verifyToken = (req, res, next) => {
//     const authHeader = req.headers.token; // หรือ req.headers.authorization ถ้าใช้ Bearer Token
//     if (authHeader) {
//         // ถ้าใช้ Bearer Token: "Bearer YOUR_TOKEN"
//         const token = authHeader.split(" ")[1];
//         // ถ้าแค่ส่ง token มาตรงๆ:
//         // const token = authHeader;

//         jwt.verify(token, process.env.JWT_SEC, (err, user) => {
//             if (err) {
//                 return res.status(403).json("Token is not valid!");
//             }
//             req.user = user; // เก็บข้อมูล user จาก JWT payload ไว้ใน req.user
//             next();
//         });
//     } else {
//         return res.status(401).json("You are not authenticated!");
//     }
// };
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const secretKey = process.env.JWT_SEC ;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // ส่งข้อมูลผู้ใช้ที่ decode แล้วไปใช้งานต่อ
    // console.log(req.user);
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// const verifyTokenAndAuthorization = (req, res, next) => {
//     verifyToken(req, res, () => {
//         // สมมติว่าใน JWT payload มี UserID และ isAdmin
//         if (req.user.UserID === parseInt(req.params.id) || req.user.isAdmin) {
//             next();
//         } else {
//             res.status(403).json("You are not allowed to do that!");
//         }
//     });
// };

// const verifyTokenAndAdmin = (req, res, next) => {
//     verifyToken(req, res, () => {
//         if (req.user.isAdmin) {
//             next();
//         } else {
//             res.status(403).json("You are not an admin!");
//         }
//     });
// };

// export { verifyToken };