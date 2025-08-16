import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from "fs";

// ✅ Get user data using Clerk ID
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth(); // Clerk userId
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Update user data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findOne({ clerkId: userId });
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // ✅ handle username (prevent duplicates)
    if (!username) username = tempUser.username;
    username = username.trim();

    if (tempUser.username !== username) {
      const existing = await User.findOne({ username });
      if (existing) {
        username = tempUser.username; // revert to old username if taken
      }
    }

    const updatedData = { username, bio, location, full_name };

    // ✅ Profile picture upload
    const profile = req.files?.profile?.[0];
    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      updatedData.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "512" }],
      });

      fs.unlinkSync(profile.path); // cleanup temp file
    }

    // ✅ Cover photo upload
    const cover = req.files?.cover?.[0];
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      updatedData.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
      });

      fs.unlinkSync(cover.path); // cleanup temp file
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      updatedData,
      { new: true }
    );

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Discover users by username/email/full_name/location
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    }).limit(20);

    // ✅ Exclude current user
    const filteredUsers = allUsers.filter((u) => u.clerkId !== userId);

    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth(); // current user clerkId
    const { id } = req.body; // target clerkId

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.following.includes(id)) {
      return res.json({ success: false, message: "Already following this user" });
    }

    user.following.push(id);
    await user.save();

    const toUser = await User.findOne({ clerkId: id });
    if (toUser && !toUser.followers.includes(userId)) {
      toUser.followers.push(userId);
      await toUser.save();
    }

    res.json({ success: true, message: "Now following user" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.json({ success: false, message: "User not found" });

    user.following = user.following.filter((f) => f !== id);
    await user.save();

    const toUser = await User.findOne({ clerkId: id });
    if (toUser) {
      toUser.followers = toUser.followers.filter((f) => f !== userId);
      await toUser.save();
    }

    res.json({ success: true, message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
