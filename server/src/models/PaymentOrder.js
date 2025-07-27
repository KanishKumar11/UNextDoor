import mongoose from 'mongoose';

const paymentOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  displayAmount: {
    type: Number,
    required: false // Optional for backward compatibility
  },
  displayCurrency: {
    type: String,
    required: false // Optional for backward compatibility
  },
  paymentAmountINR: {
    type: Number,
    required: false // Optional for backward compatibility
  },
  status: {
    type: String,
    enum: ['created', 'processing', 'paid', 'failed', 'expired'],
    default: 'created'
  },
  planDetails: {
    type: Object,
    required: true
  },
  userDetails: {
    type: Object,
    required: true
  },
  prorationCredit: {
    type: Number,
    default: 0
  },
  originalAmount: {
    type: Number,
    required: true
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Index for cleanup
paymentOrderSchema.index({ status: 1, createdAt: 1 });
paymentOrderSchema.index({ userId: 1, status: 1 });

export default mongoose.model('PaymentOrder', paymentOrderSchema);
