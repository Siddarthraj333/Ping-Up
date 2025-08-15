import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from "fs";

// ✅ Helper function: upload image to ImageKit & delete temp file
const uploadImage = async (file, width) => {
    const buffer = fs.readFileSync(file.path);
    const response = await imagekit.upload({
        file: buffer,
        fileName: file.originalname,
    });

    fs.unlinkSync(file.path); // cleanup temp file

    return imagekit.url({
        path: response.filePath,
        transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: String(width) }
        ]
    });
};

// ✅ Get user data by Clerk userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth; // Clerk's userId (string)

        const user = await User.findOne({ clerkId: userId }).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Update user profile
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth;
        let { username, bio, location, full_name } = req.body;

        const currentUser = await User.findOne({ clerkId: userId });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Keep old username if not provided
        if (!username) {
            username = currentUser.username;
        }

        // Check username uniqueness if changed
        if (username && currentUser.username !== username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                username = currentUser.username; // fallback
            }
        }

        const updatedData = { username, bio, location, full_name };

        // ✅ Profile image
        if (req.files?.profile?.[0]) {
            updatedData.profile_picture = await uploadImage(req.files.profile[0], 512);
        }

        // ✅ Cover photo
        if (req.files?.cover?.[0]) {
            updatedData.cover_photo = await uploadImage(req.files.cover[0], 1280);
        }

        const updatedUser = await User.findOneAndUpdate(
            { clerkId: userId },
            updatedData,
            { new: true }
        );

        res.status(200).json({ success: true, user: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Search users
export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { input } = req.body;

        const regex = new RegExp(input, "i");
        const users = await User.find({
            $or: [
                { username: regex },
                { email: regex },
                { full_name: regex },
                { location: regex }
            ],
            clerkId: { $ne: userId } // exclude current user
        }).lean();

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Follow a user
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body; // id = clerkId of user to follow

        if (userId === id) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const [me, target] = await Promise.all([
            User.findOne({ clerkId: userId }),
            User.findOne({ clerkId: id })
        ]);

        if (!me || !target) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (me.following.includes(id)) {
            return res.status(409).json({ success: false, message: "Already following" });
        }

        me.following.push(id);
        target.followers.push(userId);

        await Promise.all([me.save(), target.save()]);

        res.status(200).json({ success: true, message: "Now following this user" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Unfollow a user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body; // id = clerkId of user to unfollow

        const [me, target] = await Promise.all([
            User.findOne({ clerkId: userId }),
            User.findOne({ clerkId: id })
        ]);

        if (!me || !target) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        me.following = me.following.filter(f => f !== id);
        target.followers = target.followers.filter(f => f !== userId);

        await Promise.all([me.save(), target.save()]);

        res.status(200).json({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
