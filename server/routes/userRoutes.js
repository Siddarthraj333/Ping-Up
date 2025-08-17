import express from 'express';
import { 
  discoverUsers, 
  followUser, 
  getUserData, 
  unfollowUser, 
  updateUserData
} from '../controllers/userControllers.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';

const userRouter = express.Router();

// ✅ Get logged-in user data (auto-create if missing)
userRouter.get('/data', protect, getUserData);

// ✅ Update user data (with profile & cover uploads)
userRouter.post(
  '/update',
  protect,
  upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  updateUserData
);

// ✅ Discover users
userRouter.get('/discover', protect, discoverUsers);

// ✅ Follow / Unfollow
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);

export default userRouter;
