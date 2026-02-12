require('dotenv').config();
const express = require('express');
const cors = require('cors');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const stripeWebhook = require('./webhooks/stripeWebhook');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Webhook ANTES do express.json()
// O Stripe exige o corpo cru (raw body) para validar a assinatura
app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/subscriptions', subscriptionRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('RestroFlow API is running 🚀');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});