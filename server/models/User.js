import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, 
    email: { type: String, required: true },
    username: { type: String, unique: true },
    full_name: { type: String },
    bio: { type: String },
    location: { type: String },
    profile_picture: { type: String },
    cover_photo: { type: String },
    followers: { type: [String], default: [] },
    following: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
