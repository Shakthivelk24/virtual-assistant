import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    console.log("========== AUTH CHECK ==========");

    console.log("Authorization:", req.headers.authorization);
    console.log("Cookies:", req.cookies);

    let authToken = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      authToken = authHeader.split(" ")[1];
    }

    // 2. Fallback to cookie
    if (!authToken) {
      authToken = req.cookies?.token;
    }

    if (!authToken) {
      console.log("❌ NO TOKEN RECEIVED");

      return res.status(401).json({
        message: "Unauthorized - Token missing",
      });
    }

    console.log(
      "TOKEN RECEIVED:",
      authToken.substring(0, 20) + "..."
    );

    const verified = jwt.verify(
      authToken,
      process.env.JWT_SECRET
    );


    req.userId = verified.id;

    next();

  } catch (error) {

    console.error("❌ AUTHENTICATION ERROR:", error);

    return res.status(401).json({
      message: "Unauthorized - Invalid token",
    });
  }
};

export default isAuth;