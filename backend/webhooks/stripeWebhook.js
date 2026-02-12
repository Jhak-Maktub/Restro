const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const Tenant = require('../models/Tenant'); // Importar modelo Mongoose real
// const Subscription = require('../models/Subscription');

module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Validação de assinatura de segurança do Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const dataObject = event.data.object;

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = dataObject;
      const tenantId = session.client_reference_id;
      const stripeSubscriptionId = session.subscription;
      const newPlan = session.metadata.plan; 
      
      console.log(`💰 [Stripe Webhook] Checkout Completed!
        - Tenant ID: ${tenantId}
        - Plan: ${newPlan}
        - Subscription ID: ${stripeSubscriptionId}`);

      // Aqui você ativaria o plano no banco de dados
      // updateTenantPlan(tenantId, newPlan, stripeSubscriptionId, 'active');
      break;
    }

    case 'customer.subscription.created': {
      // Ocorre quando a assinatura é criada.
      // Geralmente checkout.session.completed é suficiente para o fluxo inicial, 
      // mas este evento confirma que o objeto Subscription existe no Stripe.
      console.log(`✨ [Stripe Webhook] Subscription Created: ${dataObject.id}`);
      break;
    }

    case 'customer.subscription.updated': {
      // Ocorre na renovação automática (pagamento bem-sucedido de nova fatura)
      // ou mudança de plano.
      const subscriptionId = dataObject.id;
      const status = dataObject.status; // 'active', 'past_due', etc.
      const currentPeriodEnd = new Date(dataObject.current_period_end * 1000);
      
      console.log(`🔄 [Stripe Webhook] Subscription Updated: ${subscriptionId}`);
      console.log(`   - Status: ${status}`);
      console.log(`   - Renews at: ${currentPeriodEnd.toISOString()}`);

      // Atualizar no banco de dados a data de expiração/renovação
      // updateSubscriptionStatus(subscriptionId, status, currentPeriodEnd);
      break;
    }

    case 'customer.subscription.deleted': {
      // Ocorre quando a assinatura é cancelada (pelo usuário ou falta de pagamento)
      const subscriptionId = dataObject.id;
      const tenantId = dataObject.metadata.tenantId; // Recuperado dos metadados se disponíveis

      console.log(`❌ [Stripe Webhook] Subscription Deleted/Canceled: ${subscriptionId}`);
      
      // Reverter tenant para plano gratuito ou bloquear acesso
      // revertTenantToFree(tenantId);
      break;
    }

    default:
      console.log(`ℹ️ [Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};