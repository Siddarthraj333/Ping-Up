import { getAuth } from "@clerk/express"; // or @clerk/clerk-sdk-node (depends on your setup)

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req); // Clerk gives you userId

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    req.user = { _id: userId }; // attach user to request
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};
