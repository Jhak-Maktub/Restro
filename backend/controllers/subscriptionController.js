const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId, tenantId } = req.body;
    
    console.log(`[Stripe] Criando sessão de checkout para Tenant: ${tenantId} | Plano: ${planId}`);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Mapeamento de Planos para Preços do Stripe (IDs de Produção/Teste)
    // CERTIFIQUE-SE que estes IDs no .env correspondem a preços recorrentes no Stripe Dashboard
    const prices = {
      'PRO': process.env.STRIPE_PRICE_PRO,
      'PREMIUM': process.env.STRIPE_PRICE_PREMIUM, 
    };

    if (!prices[planId]) {
      return res.status(400).json({ error: 'Plano inválido ou ID de preço não configurado.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[planId],
          quantity: 1,
        },
      ],
      mode: 'subscription', // Modo assinatura para pagamentos recorrentes
      success_url: `${frontendUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/upgrade/cancel`,
      client_reference_id: tenantId, // ID do Restaurante para identificar no Webhook
      subscription_data: {
        metadata: {
          tenantId: tenantId,
          plan: planId
        }
      },
      metadata: {
        plan: planId,
        tenantId: tenantId
      }
    });

    console.log(`[Stripe] Sessão criada: ${session.id}`);
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
};