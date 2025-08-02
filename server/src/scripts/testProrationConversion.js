/**
 * Simple test script to verify proration credit currency conversion
 * 
 * This script tests the specific issue where:
 * - USD proration credit shows INR amounts with USD symbol
 * - INR proration credit shows USD amounts with INR symbol
 */

import mongoose from 'mongoose';
import config from '../config/index.js';
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
 * Test the specific currency conversion issue
 */
async function testProrationConversion() {
  console.log('🧪 Testing Proration Credit Currency Conversion Issue...\n');

  const controller = new SubscriptionController();
  
  // Test Case 1: USD subscription upgrading to INR plan
  console.log('📋 Test Case 1: USD subscription → INR plan upgrade');
  console.log('Expected: USD proration credit should be converted to INR');
  
  const usdSubscription = {
    planId: 'basic_monthly',
    planName: 'Basic Monthly',
    amount: 16600, // $1.99 * 83.33 = 165.83 INR = 16583 paise (stored as INR paise for payment)
    displayPrice: 1.99, // USD display price
    currency: 'USD',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date()
  };
  
  const inrPlanDetails = {
    id: 'standard_quarterly',
    name: 'Standard',
    price: 399, // INR price
    currency: 'INR',
    currencySymbol: '₹'
  };
  
  try {
    const upgrade1 = controller.calculateUpgrade(usdSubscription, inrPlanDetails);
    
    console.log('Results:');
    console.log(`  Existing: USD $${usdSubscription.displayPrice}`);
    console.log(`  New Plan: INR ₹${inrPlanDetails.price}`);
    console.log(`  Proration Credit: ${upgrade1.prorationCredit}`);
    console.log(`  Expected Currency: INR (₹)`);
    console.log(`  Actual Currency: ${upgrade1.newCurrency}`);
    console.log(`  Conversion Applied: ${upgrade1.currencyConverted}`);
    
    // Validate
    const isCorrect = upgrade1.newCurrency === 'INR' && upgrade1.currencyConverted === true && upgrade1.prorationCredit > 10;
    console.log(`  Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Expected: INR amount like ₹166 (converted from ~$2 USD)`);
    console.log(`  Got: ${upgrade1.newCurrency === 'INR' ? '₹' : '$'}${upgrade1.prorationCredit}\n`);
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}\n`);
  }
  
  // Test Case 2: INR subscription upgrading to USD plan
  console.log('📋 Test Case 2: INR subscription → USD plan upgrade');
  console.log('Expected: INR proration credit should be converted to USD');
  
  const inrSubscription = {
    planId: 'basic_monthly',
    planName: 'Basic Monthly',
    amount: 14900, // ₹149 = 14900 paise
    displayPrice: 149, // INR display price
    currency: 'INR',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date()
  };
  
  const usdPlanDetails = {
    id: 'standard_quarterly',
    name: 'Standard',
    price: 4.99, // USD price
    currency: 'USD',
    currencySymbol: '$'
  };
  
  try {
    const upgrade2 = controller.calculateUpgrade(inrSubscription, usdPlanDetails);
    
    console.log('Results:');
    console.log(`  Existing: INR ₹${inrSubscription.displayPrice}`);
    console.log(`  New Plan: USD $${usdPlanDetails.price}`);
    console.log(`  Proration Credit: ${upgrade2.prorationCredit}`);
    console.log(`  Expected Currency: USD ($)`);
    console.log(`  Actual Currency: ${upgrade2.newCurrency}`);
    console.log(`  Conversion Applied: ${upgrade2.currencyConverted}`);
    
    // Validate
    const isCorrect = upgrade2.newCurrency === 'USD' && upgrade2.currencyConverted === true && upgrade2.prorationCredit < 10;
    console.log(`  Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Expected: USD amount like $1.80 (converted from ~₹150 INR)`);
    console.log(`  Got: ${upgrade2.newCurrency === 'USD' ? '$' : '₹'}${upgrade2.prorationCredit}\n`);
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}\n`);
  }
  
  // Test Case 3: Same currency (should not convert)
  console.log('📋 Test Case 3: INR subscription → INR plan upgrade (no conversion)');
  
  try {
    const upgrade3 = controller.calculateUpgrade(inrSubscription, inrPlanDetails);
    
    console.log('Results:');
    console.log(`  Existing: INR ₹${inrSubscription.displayPrice}`);
    console.log(`  New Plan: INR ₹${inrPlanDetails.price}`);
    console.log(`  Proration Credit: ${upgrade3.prorationCredit}`);
    console.log(`  Expected Currency: INR (₹)`);
    console.log(`  Actual Currency: ${upgrade3.newCurrency}`);
    console.log(`  Conversion Applied: ${upgrade3.currencyConverted}`);
    
    // Validate
    const isCorrect = upgrade3.newCurrency === 'INR' && upgrade3.currencyConverted === false;
    console.log(`  Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Expected: INR amount like ₹75 (no conversion needed)`);
    console.log(`  Got: ₹${upgrade3.prorationCredit}\n`);
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}\n`);
  }
}

/**
 * Test manual conversion calculations
 */
function testManualConversions() {
  console.log('🔢 Testing Manual Conversion Calculations...\n');
  
  const testCases = [
    {
      name: 'USD to INR',
      amount: 2.00,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      expectedRange: [160, 170] // $2 * 83.33 ≈ ₹166
    },
    {
      name: 'INR to USD', 
      amount: 150,
      fromCurrency: 'INR',
      toCurrency: 'USD',
      expectedRange: [1.7, 1.9] // ₹150 / 83.33 ≈ $1.80
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`📋 ${testCase.name}:`);
    console.log(`  Input: ${testCase.fromCurrency === 'USD' ? '$' : '₹'}${testCase.amount}`);
    
    let converted;
    if (testCase.fromCurrency === 'USD' && testCase.toCurrency === 'INR') {
      converted = Math.round((testCase.amount * 83.33) * 100) / 100;
    } else if (testCase.fromCurrency === 'INR' && testCase.toCurrency === 'USD') {
      converted = Math.round((testCase.amount / 83.33) * 100) / 100;
    }
    
    const inRange = converted >= testCase.expectedRange[0] && converted <= testCase.expectedRange[1];
    console.log(`  Output: ${testCase.toCurrency === 'USD' ? '$' : '₹'}${converted}`);
    console.log(`  Expected Range: ${testCase.toCurrency === 'USD' ? '$' : '₹'}${testCase.expectedRange[0]} - ${testCase.toCurrency === 'USD' ? '$' : '₹'}${testCase.expectedRange[1]}`);
    console.log(`  Status: ${inRange ? '✅ PASS' : '❌ FAIL'}\n`);
  });
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 Running Proration Credit Conversion Tests\n');
  console.log('=' .repeat(60));

  try {
    await connectDB();
    
    testManualConversions();
    console.log('=' .repeat(60));
    
    await testProrationConversion();
    console.log('=' .repeat(60));
    
    console.log('🎉 Tests completed!');
    console.log('\nIf you see failures, the issue is:');
    console.log('❌ USD proration showing INR amounts with $ symbol');
    console.log('❌ INR proration showing USD amounts with ₹ symbol');
    console.log('\nIf you see passes, the conversion is working correctly:');
    console.log('✅ USD proration properly converted to INR amounts');
    console.log('✅ INR proration properly converted to USD amounts');
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testProrationConversion, testManualConversions, runTests };
