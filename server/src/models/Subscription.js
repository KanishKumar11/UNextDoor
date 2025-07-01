import mongoose from "mongoose";

/**
 * Subscription model for managing user subscription plans
 * Follows SOLID principles with clear separation of concerns
 */

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Plan identification
    planId: {
      type: String,
      required: true, // e.g., 'basic_monthly', 'standard_quarterly'
    },
    planType: {
      type: String,
      enum: ["basic", "standard", "pro"],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    planPrice: {
      type: Number,
      required: true, // Price in smallest currency unit (paise for INR)
    },
    planDuration: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      required: true,
    },
    
    // Subscription status tracking
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired", "pending"],
      default: "pending",
    },
    
    // Date tracking
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    
    // Gateway integration fields
    gatewayCustomerId: {
      type: String,
      sparse: true,
    },
    gatewaySubscriptionId: {
      type: String,
      sparse: true,
    },
    
    // Payment details
    paymentMethod: {
      type: String,
      enum: ["razorpay", "card", "netbanking", "wallet", "upi"],
      default: "razorpay",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    interval: {
      type: String,
      enum: ["month", "year"],
      required: true,
    },
    intervalCount: {
      type: Number,
      required: true,
      default: 1,
    },
    
    // Razorpay integration fields
    razorpaySubscriptionId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    razorpayPlanId: {
      type: String,
      required: true,
    },
    razorpayCustomerId: {
      type: String,
      required: true,
    },
    
    // Payment tracking
    lastPaymentId: {
      type: String,
    },
    lastPaymentDate: {
      type: Date,
    },
    
    // Auto-renewal setting
    autoRenewal: {
      type: Boolean,
      default: true,
    },
    
    // Feature access control
    features: {
      lessonsPerPeriod: {
        type: Number,
        required: true,
      },
      hasForumAccess: {
        type: Boolean,
        default: false,
      },
      hasLiveChatSupport: {
        type: Boolean,
        default: false,
      },
      hasBonusContent: {
        type: Boolean,
        default: false,
      },
      hasCertification: {
        type: Boolean,
        default: false,
      },
      hasEarlyAccess: {
        type: Boolean,
        default: false,
      },
      discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    
    // Usage tracking
    lessonsConsumed: {
      type: Number,
      default: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
    
    // Upgrade/downgrade tracking
    previousPlan: {
      type: String,
      default: null,
    },
    upgradeCredits: {
      type: Number,
      default: 0, // Credits from prorated upgrades
    },
    
    // Cancellation tracking
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    // Scheduled downgrade tracking
    scheduledDowngrade: {
      planId: {
        type: String,
        default: null,
      },
      planName: {
        type: String,
        default: null,
      },
      scheduledDate: {
        type: Date,
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
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
      { userId: 1 }, // Non-unique index for efficient queries
      { status: 1 },
      { endDate: 1 },
      { razorpaySubscriptionId: 1 },
      { userId: 1, status: 1 }, // Compound index for finding user's active subscription
    ],
  }
);

// Instance methods following DRY principle

subscriptionSchema.methods.isActive = function () {
  return this.status === "active" && this.endDate > new Date();
};

subscriptionSchema.methods.isExpired = function () {
  return this.endDate <= new Date();
};

subscriptionSchema.methods.daysUntilExpiry = function () {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

subscriptionSchema.methods.canAccessLesson = function () {
  if (!this.isActive()) return false;
  
  // Pro plan has unlimited access
  if (this.planType === "pro") return true;
  
  // Check if user has consumed their lesson quota
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Reset counter if new billing period
  if (this.lastResetDate < monthStart) {
    this.lessonsConsumed = 0;
    this.lastResetDate = now;
  }
  
  return this.lessonsConsumed < this.features.lessonsPerPeriod;
};

subscriptionSchema.methods.consumeLesson = function () {
  if (this.canAccessLesson() && this.planType !== "pro") {
    this.lessonsConsumed += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

subscriptionSchema.methods.calculateProrationCredit = function (newPlanPrice) {
  const now = new Date();
  const totalDuration = this.endDate - this.startDate;
  const remainingDuration = this.endDate - now;
  const remainingPercentage = remainingDuration / totalDuration;
  
  return Math.round(this.planPrice * remainingPercentage);
};

// Static methods for plan management

subscriptionSchema.statics.getPlanConfig = function (planType) {
  const plans = {
    basic: {
      name: "Basic Plan",
      price: 14900, // ₹149 in paise
      duration: "monthly",
      features: {
        lessonsPerPeriod: 10,
        hasForumAccess: false,
        hasLiveChatSupport: false,
        hasBonusContent: false,
        hasCertification: false,
        hasEarlyAccess: false,
        discountPercentage: 0,
      },
    },
    standard: {
      name: "Standard Plan",
      price: 39900, // ₹399 in paise
      duration: "quarterly",
      features: {
        lessonsPerPeriod: 30,
        hasForumAccess: true,
        hasLiveChatSupport: false,
        hasBonusContent: true,
        hasCertification: true,
        hasEarlyAccess: true,
        discountPercentage: 0,
      },
    },
    pro: {
      name: "Pro Plan",
      price: 99900, // ₹999 in paise
      duration: "yearly",
      features: {
        lessonsPerPeriod: Infinity,
        hasForumAccess: true,
        hasLiveChatSupport: true,
        hasBonusContent: true,
        hasCertification: true,
        hasEarlyAccess: true,
        discountPercentage: 10,
      },
    },
  };
  
  return plans[planType];
};

subscriptionSchema.statics.findActiveByUserId = function (userId) {
  return this.findOne({
    userId,
    status: "active",
    endDate: { $gt: new Date() },
  });
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
