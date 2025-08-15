import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    // Extract email safely
    const email = email_addresses?.[0]?.email_address;
    if (!email) {
      throw new Error("Email not found in Clerk user data");
    }

    // Generate username from email prefix
    let username = email.split("@")[0];

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      username = `${username}${Math.floor(Math.random() * 10000)}`;
    }

    const userData = {
      _id: id,
      _email: email, // FIXED: match schema key
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
      username,
    };

    await User.create(userData);
  }
);

// Inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const email = email_addresses?.[0]?.email_address;
    if (!email) {
      throw new Error("Email not found in Clerk user data");
    }

    const updatedUserData = {
      _email: email, // FIXED: match schema key
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    };

    await User.findByIdAndUpdate(id, updatedUserData);
  }
);

// Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];
