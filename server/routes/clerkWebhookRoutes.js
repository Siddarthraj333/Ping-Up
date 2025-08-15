import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/clerk", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const event = req.body;
    if (!event?.type || !event?.data) return res.status(400).json({ error: "Invalid payload" });

    const { id, email_addresses, first_name, last_name, username, image_url } = event.data;

    switch (event.type) {
      case "user.created":
        await User.create({
          clerkId: id,
          email: email_addresses?.[0]?.email_address || "",
          full_name: `${first_name || ""} ${last_name || ""}`.trim(),
          username: username || email_addresses?.[0]?.email_address.split("@")[0],
          profile_picture: image_url || ""
        });
        break;
      case "user.updated":
        await User.findOneAndUpdate({ clerkId: id }, {
          email: email_addresses?.[0]?.email_address || "",
          full_name: `${first_name || ""} ${last_name || ""}`.trim(),
          username: username || email_addresses?.[0]?.email_address.split("@")[0],
          profile_picture: image_url || ""
        });
        break;
      case "user.deleted":
        await User.findOneAndDelete({ clerkId: id });
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;