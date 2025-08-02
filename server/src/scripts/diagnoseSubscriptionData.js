/**
 * Diagnostic script for subscription data issues
 * 
 * This script analyzes subscription data to identify:
 * 1. Incorrect amount storage formats
 * 2. Currency detection issues
 * 3. Display price calculation problems
 * 4. Proration credit calculation errors
 */

import mongoose from 'mongoose';
import config from '../config/index.js';
import Subscription from '../models/Subscription.js';
import SubscriptionController from '../controllers/subscriptionController.js';

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
 * Analyze existing subscriptions in the database
 */
async function analyzeExistingSubscriptions() {
  console.log('🔍 Analyzing Existing Subscriptions in Database...\n');

  try {
    const subscriptions = await Subscription.find({ status: 'active' }).limit(10);
    
    if (subscriptions.length === 0) {
      console.log('❌ No active subscriptions found in database');
      return;
    }

    console.log(`📊 Found ${subscriptions.length} active subscriptions\n`);

    subscriptions.forEach((sub, index) => {
      console.log(`📋 Subscription ${index + 1}:`);
      console.log(`  ID: ${sub._id}`);
      console.log(`  Plan ID: ${sub.planId}`);
      console.log(`  Plan Name: ${sub.planName}`);
      console.log(`  Amount (raw): ${sub.amount}`);
      console.log(`  Display Price: ${sub.displayPrice || 'NOT SET'}`);
      console.log(`  Currency: ${sub.currency || 'NOT SET'}`);
      console.log(`  Plan Price: ${sub.planPrice || 'NOT SET'}`);
      console.log(`  Created: ${sub.createdAt}`);
      
      // Analyze the data
      const analysis = analyzeSubscriptionData(sub);
      console.log(`  Analysis:`);
      console.log(`    Detected Currency: ${analysis.detectedCurrency}`);
      console.log(`    Calculated Display Price: ${analysis.calculatedDisplayPrice}`);
      console.log(`    Data Consistency: ${analysis.isConsistent ? '✅' : '❌'}`);
      console.log(`    Issues: ${analysis.issues.length > 0 ? analysis.issues.join(', ') : 'None'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error analyzing subscriptions:', error);
  }
}

/**
 * Analyze individual subscription data
 */
function analyzeSubscriptionData(subscription) {
  const issues = [];
  let detectedCurrency = subscription.currency;
  let calculatedDisplayPrice = subscription.displayPrice;

  // Currency detection logic (same as in controller)
  if (!detectedCurrency) {
    if (subscription.amount < 100) {
      detectedCurrency = 'USD';
    } else if (subscription.amount < 1000) {
      detectedCurrency = 'USD';
    } else if (subscription.amount > 10000) {
      detectedCurrency = 'INR';
    } else {
      if (subscription.displayPrice && subscription.displayPrice < 20) {
        detectedCurrency = 'USD';
      } else {
        detectedCurrency = 'INR';
      }
    }
  }

  // Display price calculation logic (same as in controller)
  if (!calculatedDisplayPrice) {
    if (detectedCurrency === 'USD') {
      if (subscription.amount < 100) {
        calculatedDisplayPrice = subscription.amount;
      } else if (subscription.amount < 1000) {
        calculatedDisplayPrice = Math.round((subscription.amount / 100) * 100) / 100;
      } else {
        calculatedDisplayPrice = Math.round((subscription.amount / 8333) * 100) / 100;
      }
    } else {
      if (subscription.amount < 1000) {
        calculatedDisplayPrice = subscription.amount;
      } else {
        calculatedDisplayPrice = subscription.amount / 100;
      }
    }
  }

  // Validation checks
  if (calculatedDisplayPrice < 0.01) {
    issues.push('Display price too small');
  }

  if (detectedCurrency === 'INR' && calculatedDisplayPrice < 50) {
    issues.push('INR price suspiciously low');
  }

  if (detectedCurrency === 'USD' && calculatedDisplayPrice < 0.99) {
    issues.push('USD price suspiciously low');
  }

  // Check consistency between amount and displayPrice
  let isConsistent = true;
  if (subscription.displayPrice) {
    const expectedAmount = detectedCurrency === 'USD' ? 
      subscription.displayPrice * 100 : // USD stored as cents
      subscription.displayPrice * 100;  // INR stored as paise
    
    const amountDifference = Math.abs(subscription.amount - expectedAmount);
    if (amountDifference > 10) { // Allow small rounding differences
      issues.push(`Amount/DisplayPrice mismatch: ${subscription.amount} vs expected ${expectedAmount}`);
      isConsistent = false;
    }
  }

  return {
    detectedCurrency,
    calculatedDisplayPrice,
    isConsistent,
    issues
  };
}

/**
 * Test proration calculation with sample data
 */
async function testProrationCalculation() {
  console.log('🧪 Testing Proration Calculation with Sample Data...\n');

  const controller = new SubscriptionController();

  // Test cases with different data formats
  const testCases = [
    {
      name: 'Correct INR Subscription',
      subscription: {
        planId: 'basic_monthly',
        amount: 14900, // ₹149 stored as paise
        displayPrice: 149,
        currency: 'INR',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000), // 27 days remaining
        createdAt: new Date()
      },
      newPlan: {
        id: 'standard_quarterly',
        price: 399,
        currency: 'INR'
      },
      expectedProrationRange: [120, 140] // Should be around ₹130
    },
    {
      name: 'Problematic Small Amount',
      subscription: {
        planId: 'basic_monthly',
        amount: 1.99, // Suspicious small amount
        displayPrice: null,
        currency: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      newPlan: {
        id: 'standard_quarterly',
        price: 399,
        currency: 'INR'
      },
      expectedProrationRange: [0, 5] // Will be very small due to wrong data
    },
    {
      name: 'Correct USD Subscription',
      subscription: {
        planId: 'basic_monthly',
        amount: 199, // $1.99 stored as cents
        displayPrice: 1.99,
        currency: 'USD',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      newPlan: {
        id: 'standard_quarterly',
        price: 4.99,
        currency: 'USD'
      },
      expectedProrationRange: [1.5, 2.0] // Should be around $1.75
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Test Case: ${testCase.name}`);
    
    try {
      const upgrade = controller.calculateUpgrade(testCase.subscription, testCase.newPlan);
      
      console.log(`  Results:`);
      console.log(`    Is Upgrade: ${upgrade.isUpgrade}`);
      console.log(`    Proration Credit Display: ${upgrade.prorationCreditDisplay}`);
      console.log(`    Dual Values:`, upgrade.prorationCredit);
      
      // Check if result is in expected range
      const inRange = upgrade.prorationCreditDisplay >= testCase.expectedProrationRange[0] && 
                     upgrade.prorationCreditDisplay <= testCase.expectedProrationRange[1];
      
      console.log(`    Expected Range: ${testCase.expectedProrationRange[0]} - ${testCase.expectedProrationRange[1]}`);
      console.log(`    Status: ${inRange ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!inRange) {
        console.log(`    ⚠️  Proration credit ${upgrade.prorationCreditDisplay} is outside expected range`);
      }
      
    } catch (error) {
      console.log(`    ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
}

/**
 * Generate recommendations for fixing subscription data
 */
function generateRecommendations() {
  console.log('💡 Recommendations for Fixing Subscription Data Issues...\n');

  console.log('1. **Data Migration Script Needed:**');
  console.log('   - Identify subscriptions with incorrect amount storage');
  console.log('   - Standardize amount storage format (always use smallest currency unit)');
  console.log('   - Set missing currency and displayPrice fields');
  console.log('');

  console.log('2. **Validation Rules to Implement:**');
  console.log('   - INR subscriptions: amount should be > 5000 (₹50+ stored as paise)');
  console.log('   - USD subscriptions: amount should be > 99 ($0.99+ stored as cents)');
  console.log('   - displayPrice should always be set and consistent with amount');
  console.log('   - currency field should always be set');
  console.log('');

  console.log('3. **Immediate Fixes:**');
  console.log('   - Add validation in calculateUpgrade method');
  console.log('   - Throw errors for suspicious data instead of proceeding');
  console.log('   - Log detailed warnings for data inconsistencies');
  console.log('   - Provide fallback logic for edge cases');
  console.log('');

  console.log('4. **Testing Strategy:**');
  console.log('   - Test with various subscription data formats');
  console.log('   - Validate proration calculations against expected ranges');
  console.log('   - Test currency detection logic with edge cases');
  console.log('   - Verify dual-value proration credit calculations');
}

/**
 * Main diagnostic execution
 */
async function runDiagnostics() {
  console.log('🚀 Running Subscription Data Diagnostics\n');
  console.log('=' .repeat(60));

  try {
    await connectDB();
    
    await analyzeExistingSubscriptions();
    console.log('=' .repeat(60));
    
    await testProrationCalculation();
    console.log('=' .repeat(60));
    
    generateRecommendations();
    console.log('=' .repeat(60));
    
    console.log('🎉 Diagnostics completed!');
    console.log('\nNext Steps:');
    console.log('1. Review the subscription data analysis above');
    console.log('2. Identify subscriptions with suspicious amounts');
    console.log('3. Run data migration script if needed');
    console.log('4. Test proration calculations with corrected data');
    
  } catch (error) {
    console.error('💥 Diagnostic execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run diagnostics if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostics();
}

export { analyzeExistingSubscriptions, testProrationCalculation, generateRecommendations, runDiagnostics };
