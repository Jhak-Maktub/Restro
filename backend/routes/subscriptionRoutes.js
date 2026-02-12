const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Middleware de autenticação simulado (em produção usar JWT real)
const requireAuth = (req, res, next) => {
    // Lógica de verificação de token viria aqui
    next();
};

router.post('/create-checkout-session', requireAuth, subscriptionController.createCheckoutSession);

module.exports = router;