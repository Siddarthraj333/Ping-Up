import { getAuth } from '@clerk/express';

/**
 * Middleware to protect routes by checking if user is authenticated via Clerk.
 */
export const protect = (req, res, next) => {
  try {
    const { userId } = getAuth(req); // ✅ get the userId from Clerk

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // Attach userId to request object for downstream usage
    req.userId = userId;

    next(); // allow the request to proceed
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
