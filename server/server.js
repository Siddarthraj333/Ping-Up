import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";

const app = express();
await connectDB();

app.use(express.json());
app.use(cors());

// Health check
app.get("/", (req, res) => res.send("server is running"));

/**
 * ✅ Clerk Webhook Endpoint
 * Clerk sends raw events (type: user.created, etc.)
 * We transform them into Inngest events (clerk/user.created) 
 * and forward to Inngest.
 */
app.post("/api/webhooks/clerk", async (req, res) => {
  try {
    const event = req.body;

    // Transform Clerk -> Inngest event
    const inngestEvent = {
      name: `clerk/${event.type}`, // e.g. "clerk/user.created"
      data: event.data,            // user object from Clerk
      ts: Date.now(),              // timestamp in ms
    };

    // Send event to Inngest
    await inngest.send(inngestEvent);

    return res.status(200).json({ delivered: true });
  } catch (error) {
    console.error("Error handling Clerk webhook:", error);
    return res.status(500).json({ error: "Webhook handling failed" });
  }
});

/**
 * ✅ Inngest Function Serving Endpoint
 * Inngest hits this to run your functions
 */
app.use("/api/inngest", serve({ client: inngest, functions }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`server is running on port ${PORT}`)
);
