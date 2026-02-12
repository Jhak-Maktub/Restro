const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  tenantId: {
    type: String, // ou mongoose.Schema.Types.ObjectId se usar referência
    required: true,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['STARTER', 'PRO', 'PREMIUM'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'incomplete'],
    default: 'incomplete'
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);