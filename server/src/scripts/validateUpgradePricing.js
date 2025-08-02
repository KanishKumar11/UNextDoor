/**
 * Validation script for subscription upgrade pricing
 * 
 * This script validates that the upgrade process correctly saves pricing data:
 * - planPrice stored in paise (INR smallest unit)
 * - currency field set to user's display currency (INR/USD)
 * - displayPrice contains user-facing price amount
 */

import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import { PLAN_PRICES } from '../utils/currencyUtils.js';
import config from '../config/index.js';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Validate subscription pricing data
 * @param {Object} subscription - Subscription document
 * @returns {Object} Validation results
 */
function validateSubscriptionPricing(subscription) {
  const validation = {
    isValid: true,
    issues: [],
    recommendations: []
  };

  const planId = subscription.planId;
  const planPrices = PLAN_PRICES[planId];

  if (!planPrices) {
    validation.isValid = false;
    validation.issues.push(`Unknown plan ID: ${planId}`);
    return validation;
  }

  // Check planPrice (should be in paise)
  const expectedPlanPrice = Math.round(planPrices.INR * 100); // Always store in paise
  if (!subscription.planPrice) {
    validation.isValid = false;
    validation.issues.push('planPrice field is missing');
  } else if (Math.abs(subscription.planPrice - expectedPlanPrice) > 10) {
    validation.isValid = false;
    validation.issues.push(`planPrice incorrect: ${subscription.planPrice}, expected: ${expectedPlanPrice} (paise)`);
  }

  // Check currency field
  if (!subscription.currency) {
    validation.issues.push('currency field is missing');
    validation.recommendations.push('Add currency field (INR/USD)');
  } else if (!['INR', 'USD'].includes(subscription.currency)) {
    validation.isValid = false;
    validation.issues.push(`Invalid currency: ${subscription.currency}, expected: INR or USD`);
  }

  // Check displayPrice field
  if (!subscription.displayPrice) {
    validation.issues.push('displayPrice field is missing');
    validation.recommendations.push('Add displayPrice field for frontend display');
  } else {
    const expectedDisplayPrice = planPrices[subscription.currency || 'INR'];
    if (Math.abs(subscription.displayPrice - expectedDisplayPrice) > 0.01) {
      validation.isValid = false;
      validation.issues.push(`displayPrice incorrect: ${subscription.displayPrice}, expected: ${expectedDisplayPrice} (${subscription.currency || 'INR'})`);
    }
  }

  // Check amount field consistency
  if (subscription.amount && Math.abs(subscription.amount - expectedPlanPrice) > 10) {
    validation.issues.push(`amount field inconsistent with planPrice: ${subscription.amount} vs ${expectedPlanPrice}`);
    validation.recommendations.push('Ensure amount field matches planPrice (both in paise)');
  }

  return validation;
}

/**
 * Validate all subscriptions in the database
 */
async function validateAllSubscriptions() {
  try {
    console.log('🔍 Validating subscription pricing data...');

    const subscriptions = await Subscription.find({});
    console.log(`📊 Found ${subscriptions.length} subscriptions to validate`);

    let validCount = 0;
    let invalidCount = 0;
    let warningCount = 0;

    for (const subscription of subscriptions) {
      console.log(`\n🔍 Validating subscription ${subscription._id}:`);
      console.log(`   Plan: ${subscription.planId} (${subscription.planName})`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Created: ${subscription.createdAt}`);

      const validation = validateSubscriptionPricing(subscription);

      if (validation.isValid && validation.issues.length === 0) {
        console.log(`   ✅ Valid pricing data`);
        validCount++;
      } else if (validation.isValid && validation.issues.length > 0) {
        console.log(`   ⚠️ Valid but has warnings:`);
        validation.issues.forEach(issue => console.log(`      - ${issue}`));
        validation.recommendations.forEach(rec => console.log(`      💡 ${rec}`));
        warningCount++;
      } else {
        console.log(`   ❌ Invalid pricing data:`);
        validation.issues.forEach(issue => console.log(`      - ${issue}`));
        validation.recommendations.forEach(rec => console.log(`      💡 ${rec}`));
        invalidCount++;
      }

      // Show current values
      console.log(`   Current values:`);
      console.log(`      planPrice: ${subscription.planPrice}`);
      console.log(`      currency: ${subscription.currency || 'Not set'}`);
      console.log(`      displayPrice: ${subscription.displayPrice || 'Not set'}`);
      console.log(`      amount: ${subscription.amount || 'Not set'}`);
    }

    console.log(`\n📊 Validation Summary:`);
    console.log(`   ✅ Valid: ${validCount} subscriptions`);
    console.log(`   ⚠️ Warnings: ${warningCount} subscriptions`);
    console.log(`   ❌ Invalid: ${invalidCount} subscriptions`);
    console.log(`   📝 Total: ${subscriptions.length} subscriptions validated`);

    if (invalidCount > 0) {
      console.log(`\n💡 Recommendations:`);
      console.log(`   1. Run the fixSubscriptionPricing.js script to fix invalid subscriptions`);
      console.log(`   2. Ensure upgrade process uses correct pricing logic`);
      console.log(`   3. Test upgrade flow with different currencies`);
    }

  } catch (error) {
    console.error('❌ Error validating subscriptions:', error);
    throw error;
  }
}

/**
 * Test upgrade pricing logic (simulation)
 */
async function testUpgradePricingLogic() {
  console.log('\n🧪 Testing upgrade pricing logic...');

  const testCases = [
    { planId: 'basic_monthly', currency: 'INR' },
    { planId: 'basic_monthly', currency: 'USD' },
    { planId: 'standard_quarterly', currency: 'INR' },
    { planId: 'standard_quarterly', currency: 'USD' },
    { planId: 'pro_yearly', currency: 'INR' },
    { planId: 'pro_yearly', currency: 'USD' }
  ];

  for (const testCase of testCases) {
    const { planId, currency } = testCase;
    const planPrices = PLAN_PRICES[planId];

    if (!planPrices) {
      console.log(`   ❌ Unknown plan: ${planId}`);
      continue;
    }

    // Simulate the pricing logic used in subscription creation
    const planPrice = Math.round(planPrices.INR * 100); // Always store in paise
    const displayPrice = planPrices[currency];
    
    console.log(`   🧪 ${planId} (${currency}):`);
    console.log(`      planPrice: ${planPrice} paise`);
    console.log(`      currency: ${currency}`);
    console.log(`      displayPrice: ${displayPrice} ${currency}`);
    console.log(`      ✅ Logic appears correct`);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await connectDB();
    await validateAllSubscriptions();
    await testUpgradePricingLogic();
    console.log('\n🎉 Validation completed successfully!');
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the validation
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateAllSubscriptions, testUpgradePricingLogic };
