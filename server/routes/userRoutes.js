import express from 'express';
import { 
  discoverUsers, 
  followUser, 
  getUserData, 
  unfollowUser, 
  updateUserData, 
  syncUser 
} from '../controllers/userControllers.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';

const userRouter = express.Router();

// ✅ Sync Clerk user to MongoDB
userRouter.post('/sync', protect, syncUser);

// ✅ Get user data
userRouter.get('/data', protect, getUserData);

// ✅ Update user data (with file upload)
userRouter.post(
  '/update',
  upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  protect,
  updateUserData
);

// ✅ Discover users
userRouter.post('/discover', protect, discoverUsers);

// ✅ Follow/unfollow
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);

export default userRouter;
