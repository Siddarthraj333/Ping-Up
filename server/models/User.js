import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true, // Always link 1:1 with Clerk
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // Must be unique in DB
      trim: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    profile_picture: {
      type: String, // URL (Clerk or custom uploaded)
      default: null,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 250,
    },
    location: {
      type: String,
      default: "",
      maxlength: 100,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // ✅ Auto-manages createdAt + updatedAt
  }
);

// Index for fast username/email lookups
userSchema.index({ username: 1, email: 1 });

const User = mongoose.model("User", userSchema);

export default User;
