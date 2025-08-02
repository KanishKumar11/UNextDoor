/**
 * Migration script to fix subscription pricing issues
 * 
 * Problem: Existing subscriptions have incorrect planPrice values
 * - USD subscriptions stored as 1.99 instead of 199 cents
 * - INR subscriptions stored as 0.0199 instead of 14900 paise
 * 
 * Solution: Update existing subscriptions with correct pricing
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

// Fix subscription pricing
async function fixSubscriptionPricing() {
  try {
    console.log('🔧 Starting subscription pricing fix...');

    // Get all subscriptions
    const subscriptions = await Subscription.find({});
    console.log(`📊 Found ${subscriptions.length} subscriptions to check`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const subscription of subscriptions) {
      const planId = subscription.planId;
      const currentPlanPrice = subscription.planPrice;
      
      console.log(`\n🔍 Checking subscription ${subscription._id}:`);
      console.log(`   Plan ID: ${planId}`);
      console.log(`   Current planPrice: ${currentPlanPrice}`);
      console.log(`   Current currency: ${subscription.currency || 'Not set'}`);

      // Get correct pricing from PLAN_PRICES
      const planPrices = PLAN_PRICES[planId];
      if (!planPrices) {
        console.log(`   ⚠️ Unknown plan ID: ${planId}, skipping`);
        skippedCount++;
        continue;
      }

      // Determine what the correct values should be
      let correctPlanPrice, correctCurrency, correctDisplayPrice;

      // Check if this looks like a USD subscription (very small planPrice)
      if (currentPlanPrice < 100) {
        // This is likely a USD subscription stored incorrectly
        correctCurrency = 'USD';
        correctDisplayPrice = planPrices.USD;
        correctPlanPrice = Math.round(planPrices.INR * 100); // Always store in paise for payment processing
        console.log(`   💡 Detected USD subscription with incorrect pricing`);
      } else if (currentPlanPrice < 1000) {
        // This might be an INR subscription stored as rupees instead of paise
        correctCurrency = 'INR';
        correctDisplayPrice = planPrices.INR;
        correctPlanPrice = Math.round(planPrices.INR * 100); // Convert to paise
        console.log(`   💡 Detected INR subscription stored in rupees instead of paise`);
      } else {
        // This looks like it might already be correct (in paise)
        correctCurrency = subscription.currency || 'INR';
        correctDisplayPrice = planPrices[correctCurrency];
        correctPlanPrice = Math.round(planPrices.INR * 100); // Always store in paise
        
        // Check if it's already correct
        if (Math.abs(currentPlanPrice - correctPlanPrice) < 10) {
          console.log(`   ✅ Subscription pricing appears correct, skipping`);
          skippedCount++;
          continue;
        }
      }

      console.log(`   🔧 Fixing pricing:`);
      console.log(`      planPrice: ${currentPlanPrice} → ${correctPlanPrice}`);
      console.log(`      currency: ${subscription.currency || 'Not set'} → ${correctCurrency}`);
      console.log(`      displayPrice: ${subscription.displayPrice || 'Not set'} → ${correctDisplayPrice}`);

      // Update the subscription
      await Subscription.findByIdAndUpdate(subscription._id, {
        planPrice: correctPlanPrice,
        currency: correctCurrency,
        displayPrice: correctDisplayPrice
      });

      fixedCount++;
      console.log(`   ✅ Fixed subscription ${subscription._id}`);
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Fixed: ${fixedCount} subscriptions`);
    console.log(`   ⏭️ Skipped: ${skippedCount} subscriptions`);
    console.log(`   📝 Total: ${subscriptions.length} subscriptions processed`);

  } catch (error) {
    console.error('❌ Error fixing subscription pricing:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await connectDB();
    await fixSubscriptionPricing();
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixSubscriptionPricing };
