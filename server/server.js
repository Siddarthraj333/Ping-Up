// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import connectDB from './configs/db.js';
// import {inngest, functions} from './inngest/index.js'
// import { serve } from "inngest/express";
// import { clerkMiddleware } from '@clerk/express'; 
// import webhookRoutes from "./routes/webhookRoutes.js";

// import userRouter from './routes/userRoutes.js';


// const app = express();

// await connectDB();

// app.use(express.json());
// app.use(cors());
// app.use(clerkMiddleware());
// app.use("/webhooks", webhookRoutes);



// app.get('/', (req, res)=>res.send('server is running'))
// app.use('/api/inngest',  serve({ client: inngest, functions }))
// app.use('/api/user',clerkMiddleware(), userRouter)

// const PORT = process.env.PORT || 4000;

// app.listen(PORT, ()=> console.log(`server is running on port ${PORT}`))




import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import {inngest, functions} from './inngest/index.js'
import {serve} from 'inngest/express'







const app = express();

// Connect to MongoDB before starting the server
await connectDB();

// Middleware
app.use(express.json());
app.use(cors());


// Health check route
app.get('/', (req, res) => res.send('✅ Server is running'));
// Inngest Functions
app.use('/api/inngest', serve({ client: inngest, functions }));





// Server listener
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
