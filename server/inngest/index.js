// import { Inngest } from "inngest";
// import User from "../models/User.js";

// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "pingup-app" });

// /**
//  * Sync Clerk User Creation
//  */
// const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event, step }) => {
//     try {
//       const { id, first_name, last_name, email_addresses, image_url } = event.data;
//       let username = email_addresses[0].email_address.split("@")[0];

//       // check availability of username
//       const existingUser = await User.findOne({ username });
//       if (existingUser) {
//         username = username + Math.floor(Math.random() * 10000);
//       }

//       const userData = {
//         clerkId: id,
//         email: email_addresses[0].email_address,
//         full_name: `${first_name} ${last_name}`,
//         profile_picture: image_url,
//         username,
//       };

//       await User.create(userData);

//       step.log("✅ User created successfully", userData);
//       return { success: true };
//     } catch (error) {
//       step.log("❌ User creation failed", error.message);
//       throw error;
//     }
//   }
// );

// /**
//  * Sync Clerk User Update
//  */
// const syncUserUpdation = inngest.createFunction(
//   { id: "update-user-from-clerk" },
//   { event: "clerk/user.updated" },
//   async ({ event, step }) => {
//     try {
//       const { id, first_name, last_name, email_addresses, image_url } = event.data;

//       const updateUserData = {
//         email: email_addresses[0].email_address,
//         full_name: `${first_name} ${last_name}`,
//         profile_picture: image_url,
//       };

//       await User.findOneAndUpdate({ clerkId: id }, updateUserData);

//       step.log("✅ User updated successfully", { clerkId: id, ...updateUserData });
//       return { success: true };
//     } catch (error) {
//       step.log("❌ User update failed", error.message);
//       throw error;
//     }
//   }
// );

// /**
//  * Sync Clerk User Deletion
//  */
// const syncUserDeletion = inngest.createFunction(
//   { id: "delete-user-from-clerk" },
//   { event: "clerk/user.deleted" },
//   async ({ event, step }) => {
//     try {
//       const { id } = event.data;

//       await User.findOneAndDelete({ clerkId: id });

//       step.log("✅ User deleted successfully", { clerkId: id });
//       return { success: true };
//     } catch (error) {
//       step.log("❌ User deletion failed", error.message);
//       throw error;
//     }
//   }
// );

// // export functions for inngest
// export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];



import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

/**
 * Sync Clerk User Creation + Update (Upsert)
 */
const syncUserUpsert = inngest.createFunction(
  { id: "upsert-user-from-clerk" },
  { event: ["clerk/user.created", "clerk/user.updated"] },
  async ({ event, step }) => {
    try {
      const { id, first_name, last_name, email_addresses, username: clerkUsername, image_url } = event.data;

      // ✅ Ensure email always exists
      const email = email_addresses?.[0]?.email_address || `noemail_${id}@example.com`;

      // ✅ Build a safe full name
      const full_name = `${first_name || ""} ${last_name || ""}`.trim() || "Unknown User";

      // ✅ Generate username if Clerk didn’t send one
      let username = clerkUsername || email.split("@")[0] || `user_${id}`;

      // ✅ Ensure username uniqueness (avoid conflicts with other Clerk IDs)
      const existingUser = await User.findOne({ username, clerkId: { $ne: id } });
      if (existingUser) {
        username = `${username}_${Math.floor(Math.random() * 10000)}`;
      }

      const userData = {
        clerkId: id,
        email,
        full_name,
        profile_picture: image_url || null,
        username,
      };

      // ✅ Upsert safely
      await User.findOneAndUpdate({ clerkId: id }, userData, {
        new: true,
        upsert: true,
        runValidators: true, // <-- enforce schema checks
      });

      step.log("✅ User upserted successfully", { clerkId: id, ...userData });
      return { success: true, data: userData };
    } catch (error) {
      step.log("❌ User upsert failed", error.message);
      throw error;
    }
  }
);


/**
 * Sync Clerk User Deletion
 */
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    try {
      const { id } = event.data;

      await User.findOneAndDelete({ clerkId: id });

      step.log("✅ User deleted successfully", { clerkId: id });
      return { success: true };
    } catch (error) {
      step.log("❌ User deletion failed", error.message);
      throw error;
    }
  }
);

// export functions for inngest
export const functions = [syncUserUpsert, syncUserDeletion];
