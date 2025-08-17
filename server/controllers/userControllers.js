import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from "fs";

// ✅ Get user data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json(user); // return same object as in DB
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update user
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { username, bio, location, full_name } = req.body;

    let updatedData = { username, bio, location, full_name };

    // profile picture
    const profile = req.files?.profile?.[0];
    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      updatedData.profile_picture = uploaded.url;
      fs.unlinkSync(profile.path);
    }

    // cover photo
    const cover = req.files?.cover?.[0];
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      updatedData.cover_photo = uploaded.url;
      fs.unlinkSync(cover.path);
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      updatedData,
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Discover users
export const discoverUsers = async (req, res) => {
  try {
    const { input } = req.body;
    const { userId } = req.auth();

    const users = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
      clerkId: { $ne: userId }, // exclude current user
    }).limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findOne({ clerkId: userId });
    const toUser = await User.findOne({ clerkId: id });

    if (!user || !toUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.following.includes(id)) user.following.push(id);
    if (!toUser.followers.includes(userId)) toUser.followers.push(userId);

    await user.save();
    await toUser.save();

    res.json({ success: true, message: "Now following", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findOne({ clerkId: userId });
    const toUser = await User.findOne({ clerkId: id });

    if (!user || !toUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.following = user.following.filter(f => f !== id);
    toUser.followers = toUser.followers.filter(f => f !== userId);

    await user.save();
    await toUser.save();

    res.json({ success: true, message: "Unfollowed", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Sync Clerk user
export const syncUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { email, full_name, username } = req.body;

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        email,
        username,
        full_name,
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

