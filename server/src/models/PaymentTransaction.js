import mongoose from "mongoose";

/**
 * Payment Transaction model for tracking all payment-related activities
 * Implements comprehensive audit trail for financial transactions
 */

const paymentTransactionSchema = new mongoose.Schema(
  {
    // User and subscription references
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: false, // Not required for new flow
    },
    
    // Plan identification
    planId: {
      type: String,
      required: true, // Plan ID like 'basic_monthly', etc.
    },
    
    // Transaction identification
    transactionId: {
      type: String,
      unique: true,
      required: true,
      default: function() {
        return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      }
    },
    
    // Razorpay integration fields
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpaySignature: {
      type: String,
    },
    
    // Gateway fields (for compatibility)
    gatewayOrderId: {
      type: String,
      required: true,
    },
    gatewayPaymentId: {
      type: String,
      sparse: true,
    },
    
    // Transaction details
    type: {
      type: String,
      enum: [
        "subscription_creation",
        "subscription_renewal",
        "subscription_upgrade",
        "subscription_downgrade",
        "refund",
        "partial_refund",
        "failed_payment",
      ],
      required: true,
    },
    
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    
    // Financial details
    amount: {
      type: Number,
      required: true, // Amount in smallest currency unit (paise)
    },
    currency: {
      type: String,
      default: "INR",
    },
    
    // Proration handling for upgrades
    originalAmount: {
      type: Number, // Original plan amount before proration
    },
    prorationCredit: {
      type: Number, // Credit applied from previous plan
      default: 0,
    },
    finalAmount: {
      type: Number, // Final amount charged (originalAmount - prorationCredit)
    },
    
    // Plan details at time of transaction
    planType: {
      type: String,
      enum: ["basic", "standard", "pro"],
      required: true,
    },
    planDuration: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      required: true,
    },
    
    // Payment method details
    paymentMethod: {
      type: String,
      enum: ["card", "netbanking", "wallet", "upi"],
    },
    paymentMethodDetails: {
      cardType: String, // visa, mastercard, etc.
      last4: String, // Last 4 digits of card
      bankName: String,
      walletType: String, // paytm, phonepe, etc.
    },
    
    // Date tracking
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    
    // Error handling
    errorCode: {
      type: String,
    },
    errorDescription: {
      type: String,
    },
    
    // Webhook verification
    webhookVerified: {
      type: Boolean,
      default: false,
    },
    webhookReceivedAt: {
      type: Date,
    },
    
    // Receipt and invoice details
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceUrl: {
      type: String,
    },
    
    // Refund details
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
    },
    refundId: {
      type: String,
    },
    
    // Retry mechanism for failed payments
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    nextRetryAt: {
      type: Date,
    },
    
    // IP and user agent for fraud detection
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    
    // Metadata for extensibility
    metadata: {
      type: Map,
      of: String,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1 },
      { subscriptionId: 1 },
      { razorpayPaymentId: 1 },
      { razorpayOrderId: 1 },
      { status: 1 },
      { type: 1 },
      { createdAt: -1 },
    ],
  }
);

// Instance methods

paymentTransactionSchema.methods.markCompleted = function (razorpayPaymentId, signature) {
  this.status = "completed";
  this.razorpayPaymentId = razorpayPaymentId;
  this.razorpaySignature = signature;
  this.completedAt = new Date();
  this.webhookVerified = true;
  this.webhookReceivedAt = new Date();
  return this.save();
};

paymentTransactionSchema.methods.markFailed = function (errorCode, errorDescription) {
  this.status = "failed";
  this.errorCode = errorCode;
  this.errorDescription = errorDescription;
  this.failedAt = new Date();
  
  // Set up retry if within retry limits
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.nextRetryAt = new Date(Date.now() + (this.retryCount * 30 * 60 * 1000)); // Exponential backoff
  }
  
  return this.save();
};

paymentTransactionSchema.methods.generateReceiptNumber = function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  this.receiptNumber = `UND-${year}${month}${day}-${random}`;
  return this.receiptNumber;
};

paymentTransactionSchema.methods.canRetry = function () {
  return (
    this.status === "failed" &&
    this.retryCount < this.maxRetries &&
    this.nextRetryAt &&
    this.nextRetryAt <= new Date()
  );
};

// Static methods

paymentTransactionSchema.statics.findByRazorpayPaymentId = function (paymentId) {
  return this.findOne({ razorpayPaymentId: paymentId });
};

paymentTransactionSchema.statics.findPendingRetries = function () {
  return this.find({
    status: "failed",
    retryCount: { $lt: 3 },
    nextRetryAt: { $lte: new Date() },
  });
};

paymentTransactionSchema.statics.getRevenueStats = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: "completed",
        completedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: "$planType",
        totalRevenue: { $sum: "$finalAmount" },
        transactionCount: { $sum: 1 },
        averageAmount: { $avg: "$finalAmount" },
      },
    },
  ]);
};

const PaymentTransaction = mongoose.model("PaymentTransaction", paymentTransactionSchema);

export default PaymentTransaction;
