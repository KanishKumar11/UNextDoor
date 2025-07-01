# Payment System Implementation Guide

## Overview

This document outlines the complete implementation of the secure, extensible payment system for UNextDoor AI Tutor app using Razorpay. The system supports international payments, three subscription tiers, prorated upgrades, and feature gating.

## Subscription Plans

### 📘 Basic (Monthly) - ₹149/month
- **Lessons**: 10 new lessons/month
- **Community**: Limited forum access (read-only threads; one post per week)
- **Support**: Email support with 48-hour response time
- **Bonus Content**: No access
- **Certification**: Not included
- **Additional Perks**: Access to monthly newsletters only

### 📗 Standard (Quarterly) - ₹399/quarter
- **Lessons**: 30 new lessons/quarter (10/month equivalent)
- **Community**: Full forum access (posting and commenting) + moderated study groups
- **Support**: Priority email support with 24-hour response time
- **Bonus Content**: Access to 1 "Deep Dive" bonus lesson per month
- **Certification**: Certificate of Completion for each module (x3 per quarter)
- **Additional Perks**:
  - Early access to upcoming lessons
  - Quarterly live Q&A session

### 📕 Pro (Yearly) - ₹999/year
- **Lessons**: 120 lessons/year (10/month)
- **Community**: Full forum access + invite to exclusive Pro Slack/Discord channels
- **Support**: Live chat + email support with same-day response
- **Bonus Content**:
  - "Deep Dive" lesson each month
  - Monthly guest expert webinar
  - Access to resource library (e-books, lesson templates, worksheets)
- **Certification**:
  - Certificate of Completion for each module
  - End-of-year "Advanced Pro" certification
- **Additional Perks**:
  - Early-bird access to new features and lessons
  - 10% discount on workshops, merch, and "Mastery" one-on-one coaching packages

## Backend Implementation

### Models

#### 1. Subscription Model (`server/src/models/Subscription.js`)
- Manages user subscriptions, plan features, and billing cycles
- Supports proration calculations and upgrade history
- Tracks subscription status and cancellation reasons

#### 2. PaymentTransaction Model (`server/src/models/PaymentTransaction.js`)
- Comprehensive transaction logging and audit trail
- Supports refunds, proration credits, and dispute tracking
- Links transactions to subscriptions for complete history

### Services

#### 1. Payment Gateway Interface (`server/src/services/payment/interfaces/IPaymentGateway.js`)
- Abstract interface following SOLID principles
- Enables easy integration of multiple payment gateways
- Standardized methods for all payment operations

#### 2. Razorpay Gateway (`server/src/services/payment/gateways/RazorpayGateway.js`)
- Complete Razorpay integration with all required methods
- Handles orders, payments, subscriptions, refunds, and webhooks
- Implements signature verification for security

#### 3. Feature Gating Service (`server/src/services/featureGatingService.js`)
- Manages subscription-based feature access
- Handles "coming soon" features consistently
- Provides upgrade suggestions based on desired features

#### 4. Lesson Usage Service (`server/src/services/lessonUsageService.js`)
- Tracks lesson consumption per subscription period
- Enforces usage limits based on subscription tier
- Provides usage analytics and reporting

### Controllers

#### 1. Subscription Controller (`server/src/controllers/subscriptionController.js`)
- Handles subscription creation, upgrades, and cancellation
- Implements prorated upgrade logic
- Manages payment verification and activation

#### 2. Payment Webhook Controller (`server/src/controllers/paymentWebhookController.js`)
- Secure webhook processing with signature verification
- Handles all Razorpay webhook events
- Manages subscription state changes and notifications

#### 3. Feature Controller (`server/src/controllers/featureController.js`)
- Provides feature access information to frontend
- Returns upgrade options and pricing comparisons
- Manages "coming soon" feature listings

### Middleware

#### 1. Feature Gating Middleware (`server/src/middleware/featureGatingMiddleware.js`)
- Protects routes based on subscription tier
- Checks usage limits before allowing access
- Provides detailed access denied responses with upgrade suggestions

### API Routes

#### Subscription Routes (`/api/v1/subscriptions/`)
- `GET /plans` - Get available subscription plans
- `GET /current` - Get user's current subscription
- `POST /create-order` - Create payment order
- `POST /verify-payment` - Verify and activate subscription
- `GET /upgrade-preview/:planId` - Calculate upgrade costs
- `POST /cancel` - Cancel subscription at period end
- `POST /reactivate` - Reactivate cancelled subscription

#### Feature Routes (`/api/v1/features/`)
- `GET /user` - Get user's feature access and limits
- `GET /check/:feature` - Check specific feature access
- `GET /lessons/usage` - Get lesson usage statistics
- `GET /upgrade-options` - Get available upgrade plans
- `GET /comparison` - Get feature comparison table
- `GET /coming-soon` - Get coming soon features

#### Webhook Routes (`/api/v1/webhooks/`)
- `POST /razorpay` - Handle Razorpay webhooks
- `GET /logs` - Get webhook processing logs (admin)

## Upgrade Policy Implementation

### Prorated Upgrade System
1. **Immediate Feature Unlock**: User gets upgraded features right away
2. **Billing Cycle Change**: User's billing cycle changes to the new plan immediately
3. **Credit Calculation**: Unused portion of current plan is credited
4. **No Day Carryover**: Only monetary value is credited, not time periods

### Example Calculation
```javascript
// User on Basic Monthly (₹149), 10 days left, upgrades to Standard Quarterly (₹399)
const dailyRate = 149 / 30; // ₹4.97 per day
const unusedDays = 10;
const credit = unusedDays * dailyRate; // ₹49.70
const amountToPay = 399 - 49.70; // ₹349.30
```

### Implementation Rules
- **Upgrades Only**: Mid-cycle downgrades are not allowed
- **Immediate Access**: New features are unlocked instantly
- **Fair Pricing**: Users only pay the difference
- **Simple Renewals**: Next renewal is at full price of new plan

## Feature Gating Implementation

### Access Control Levels
1. **Free Tier**: No lesson access, coming soon features disabled
2. **Basic Tier**: 10 lessons/month, limited community access
3. **Standard Tier**: 10 lessons/month, full community, priority support
4. **Pro Tier**: 10 lessons/month, premium features, live chat support

### Coming Soon Features
Features marked as "coming soon" across all tiers:
- Live 1-on-1 Tutoring
- Group Classes
- Mobile App
- Offline Mode
- Speech Recognition
- AI Conversation Partner
- Custom Study Plans
- Advanced Analytics
- Peer Matching
- Cultural Content

### Usage Tracking
- Lesson consumption tracked per billing period
- Prevents access when limits are reached
- Provides upgrade prompts with clear benefits
- Historical usage analytics for optimization

## Security Implementation

### Payment Security
- **Server-side Validation**: All payment processing on backend
- **Signature Verification**: Webhook signature validation
- **Encrypted Storage**: Sensitive data encrypted at rest
- **No Client Secrets**: Payment keys never exposed to frontend
- **Audit Trail**: Complete transaction history logging

### Feature Security
- **Backend Enforcement**: Feature gating enforced server-side
- **Token Validation**: JWT-based authentication for all endpoints
- **Rate Limiting**: Prevents abuse of payment endpoints
- **Input Validation**: All user inputs validated and sanitized

## Environment Configuration

### Required Environment Variables
```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Feature Flags
ENABLE_PAYMENTS=true
ENABLE_FEATURE_GATING=true
ENABLE_PRORATION=true

# Security
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=10
```

## Frontend Integration Points

### Key API Endpoints for Frontend
1. **Plan Selection**: `GET /api/v1/subscriptions/plans`
2. **Feature Check**: `GET /api/v1/features/user`
3. **Payment Flow**: `POST /api/v1/subscriptions/create-order`
4. **Upgrade Preview**: `GET /api/v1/subscriptions/upgrade-preview/:planId`
5. **Usage Tracking**: `GET /api/v1/features/lessons/usage`

### Frontend Requirements
- Razorpay SDK integration for payment processing
- Feature gating UI components for "coming soon" features
- Upgrade prompts when limits are reached
- Clear pricing and benefit communication
- Subscription management interface

## Testing Strategy

### Unit Tests
- Payment gateway service methods
- Feature gating logic
- Proration calculations
- Webhook signature verification

### Integration Tests
- Complete payment flow from order to activation
- Webhook processing and state changes
- Feature access after subscription changes
- Upgrade flow with proration

### End-to-End Tests
- Full user subscription journey
- Payment failure handling
- Subscription cancellation and reactivation
- Feature access enforcement

## Deployment Considerations

### Database Migrations
- Ensure Subscription and PaymentTransaction models are deployed
- Update User model with subscription references
- Create indexes for performance optimization

### Environment Setup
- Configure Razorpay credentials
- Set up webhook endpoints
- Enable feature flags
- Configure monitoring and logging

### Monitoring
- Payment success/failure rates
- Subscription conversion metrics
- Feature usage analytics
- Webhook processing health

## Next Steps

### Phase 1: Backend Completion ✅
- ✅ Models and services implemented
- ✅ API endpoints created
- ✅ Feature gating implemented
- ✅ Webhook handling ready

### Phase 2: Frontend Integration (Next)
- [ ] Payment flow UI components
- [ ] Subscription management screens
- [ ] Feature gating in lesson components
- [ ] Upgrade prompts and pricing pages

### Phase 3: Testing & Optimization
- [ ] Comprehensive test suite
- [ ] Performance optimization
- [ ] Security audit
- [ ] User acceptance testing

### Phase 4: Production Deployment
- [ ] Production environment setup
- [ ] Monitoring and alerting
- [ ] Customer support tools
- [ ] Analytics and reporting

## Support and Maintenance

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Automatic retry mechanisms
- Fallback payment options

### Customer Support
- Transaction history access
- Subscription modification tools
- Refund processing capabilities
- Usage analytics for support

This implementation provides a solid foundation for a scalable, secure payment system that can grow with UNextDoor's business needs while maintaining excellent user experience and developer maintainability.
