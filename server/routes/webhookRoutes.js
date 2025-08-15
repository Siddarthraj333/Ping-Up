import express from 'express';
const router = express.Router();

// Example endpoint for other webhooks
router.post('/', (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).json({ received: true });
});

export default router;