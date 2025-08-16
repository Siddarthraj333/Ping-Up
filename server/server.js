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

app.use('/api/user',)





// Server listener
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
