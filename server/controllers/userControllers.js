import imagekit from "../configs/imageKit.js"
import User from "../models/User.js"
import fs from "fs"

// Get user data using Clerk userId
export const getUserData = async (req, res) => {
  try {
    console.log("Auth Payload:", req.auth())
    const { userId } = req.auth()

    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }
    res.json({ success: true, user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Update user data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth()
    let { username, bio, location, full_name } = req.body

    const tempUser = await User.findOne({ clerkId: userId })
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" })
    }

    if (!username) username = tempUser.username

    // check if username is taken
    if (tempUser.username !== username) {
      const user = await User.findOne({ username })
      if (user) {
        username = tempUser.username // fallback
      }
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    }

    const profile = req.files?.profile?.[0]
    const cover = req.files?.cover?.[0]

    if (profile) {
      const buffer = fs.readFileSync(profile.path)
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      })

      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      })
      updatedData.profile_picture = url
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path)
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      })

      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      })
      updatedData.cover_photo = url
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      updatedData,
      { new: true }
    )

    res.json({ success: true, user, message: "Profile updated successfully" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Discover users by username/email/name/location
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { input } = req.body

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    })

    // filter out self
    const filteredUsers = allUsers.filter(user => user.clerkId !== userId)

    res.json({ success: true, users: filteredUsers })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth() // current user (clerkId)
    const { id } = req.body // target user (clerkId)

    const user = await User.findOne({ clerkId: userId })
    const toUser = await User.findOne({ clerkId: id })

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" })
    }

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      })
    }

    user.following.push(id)
    await user.save()

    toUser.followers.push(userId)
    await toUser.save()

    res.json({ success: true, message: "Now you are following this user" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth()
    const { id } = req.body

    const user = await User.findOne({ clerkId: userId })
    const toUser = await User.findOne({ clerkId: id })

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" })
    }

    user.following = user.following.filter(f => f !== id)
    await user.save()

    toUser.followers = toUser.followers.filter(f => f !== userId)
    await toUser.save()

    res.json({ success: true, message: "You are no longer following this user" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}
