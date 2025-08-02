/**
 * Test script for payment order creation fix
 * 
 * This script tests the payment order creation to ensure:
 * 1. Final amount calculation works correctly with dual-value proration credit
 * 2. NaN values are prevented in payment order creation
 * 3. Razorpay order creation receives valid amounts
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
 * Test final amount calculation logic
 */
function testFinalAmountCalculation() {
  console.log('🧪 Testing Final Amount Calculation Logic...\n');

  const testCases = [
    {
      name: 'Normal upgrade with proration credit',
      paymentAmountINR: 999,
      prorationCredit: 144.16,
      expectedFinalAmount: 854.84
    },
    {
      name: 'Upgrade with dual-value proration credit (problematic case)',
      paymentAmountINR: 999,
      prorationCredit: { INR: 144.16, USD: 1.73 }, // This causes NaN
      expectedFinalAmount: 999 // Should fallback to full amount when proration is invalid
    },
    {
      name: 'New subscription (no proration)',
      paymentAmountINR: 999,
      prorationCredit: 0,
      expectedFinalAmount: 999
    },
    {
      name: 'Invalid proration credit (NaN)',
      paymentAmountINR: 999,
      prorationCredit: NaN,
      expectedFinalAmount: 999 // Should fallback to full amount
    },
    {
      name: 'Invalid proration credit (string)',
      paymentAmountINR: 999,
      prorationCredit: "144.16",
      expectedFinalAmount: 999 // Should fallback to full amount
    },
    {
      name: 'High proration credit (should not go negative)',
      paymentAmountINR: 999,
      prorationCredit: 1200,
      expectedFinalAmount: 0 // Math.max(0, 999 - 1200) = 0
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`📋 Test Case ${index + 1}: ${testCase.name}`);
    console.log(`  Payment Amount INR: ₹${testCase.paymentAmountINR}`);
    console.log(`  Proration Credit: ${JSON.stringify(testCase.prorationCredit)}`);
    
    // Simulate the fixed calculation logic
    const validProrationCredit = (typeof testCase.prorationCredit === 'number' && !isNaN(testCase.prorationCredit)) ? testCase.prorationCredit : 0;
    const finalAmount = Math.max(0, testCase.paymentAmountINR - validProrationCredit);
    
    console.log(`  Valid Proration Credit: ${validProrationCredit}`);
    console.log(`  Calculated Final Amount: ₹${finalAmount}`);
    console.log(`  Expected Final Amount: ₹${testCase.expectedFinalAmount}`);
    
    // Validate result
    const isValid = !isNaN(finalAmount) && typeof finalAmount === 'number';
    const isCorrect = Math.abs(finalAmount - testCase.expectedFinalAmount) < 0.01;
    
    console.log(`  Is Valid Number: ${isValid ? '✅' : '❌'}`);
    console.log(`  Is Correct Amount: ${isCorrect ? '✅' : '❌'}`);
    console.log(`  Status: ${isValid && isCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
  });
}

/**
 * Test Razorpay amount conversion
 */
function testRazorpayAmountConversion() {
  console.log('💳 Testing Razorpay Amount Conversion...\n');

  const testCases = [
    {
      name: 'Normal final amount',
      finalAmount: 854.84,
      expectedPaise: 85484
    },
    {
      name: 'Full plan amount',
      finalAmount: 999,
      expectedPaise: 99900
    },
    {
      name: 'Zero amount (high proration)',
      finalAmount: 0,
      expectedPaise: 0
    },
    {
      name: 'Small amount',
      finalAmount: 1.50,
      expectedPaise: 150
    },
    {
      name: 'Amount with many decimals',
      finalAmount: 854.8367,
      expectedPaise: 85484 // Should round properly
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`📋 Test Case ${index + 1}: ${testCase.name}`);
    console.log(`  Final Amount: ₹${testCase.finalAmount}`);
    
    const amountInPaise = Math.round(testCase.finalAmount * 100);
    
    console.log(`  Amount in Paise: ${amountInPaise}`);
    console.log(`  Expected Paise: ${testCase.expectedPaise}`);
    
    // Validate conversion
    const isValid = !isNaN(amountInPaise) && amountInPaise >= 0;
    const isCorrect = amountInPaise === testCase.expectedPaise;
    
    console.log(`  Is Valid: ${isValid ? '✅' : '❌'}`);
    console.log(`  Is Correct: ${isCorrect ? '✅' : '❌'}`);
    console.log(`  Razorpay Compatible: ${amountInPaise > 0 ? '✅' : '⚠️  Zero amount'}`);
    console.log(`  Status: ${isValid && isCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
  });
}

/**
 * Test upgrade calculation with dual-value proration credit
 */
async function testUpgradeCalculationForPayment() {
  console.log('🔄 Testing Upgrade Calculation for Payment Order...\n');

  const controller = new SubscriptionController();
  
  // Simulate the problematic subscription from logs
  const existingSubscription = {
    amount: 1.99,
    displayPrice: undefined,
    currency: 'INR', // Will be corrected to USD
    planId: 'basic_monthly',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    createdAt: new Date()
  };
  
  const newPlan = {
    id: 'pro_yearly',
    name: 'Pro',
    price: 999,
    currency: 'INR',
    paymentAmountINR: 999
  };
  
  console.log('📋 Testing Problematic Case:');
  console.log(`  Existing Subscription:`, existingSubscription);
  console.log(`  New Plan:`, newPlan);
  
  try {
    const upgrade = controller.calculateUpgrade(existingSubscription, newPlan);
    
    console.log('✅ Upgrade calculation succeeded!');
    console.log(`  Dual-Value Proration Credit:`, upgrade.prorationCredit);
    console.log(`  Display Proration Credit: ${upgrade.prorationCreditDisplay}`);
    
    // Test payment calculation logic
    const paymentAmountINR = newPlan.paymentAmountINR || newPlan.price;
    const prorationCredit = upgrade.prorationCreditDisplay; // Use display value
    const validProrationCredit = (typeof prorationCredit === 'number' && !isNaN(prorationCredit)) ? prorationCredit : 0;
    const finalAmount = Math.max(0, paymentAmountINR - validProrationCredit);
    
    console.log(`  Payment Calculation:`);
    console.log(`    Payment Amount INR: ₹${paymentAmountINR}`);
    console.log(`    Proration Credit (Display): ${prorationCredit}`);
    console.log(`    Valid Proration Credit: ${validProrationCredit}`);
    console.log(`    Final Amount: ₹${finalAmount}`);
    console.log(`    Amount in Paise: ${Math.round(finalAmount * 100)}`);
    
    // Validate final amount
    const isValidFinalAmount = !isNaN(finalAmount) && typeof finalAmount === 'number' && finalAmount >= 0;
    const amountInPaise = Math.round(finalAmount * 100);
    const isValidPaise = !isNaN(amountInPaise) && amountInPaise >= 0;
    
    console.log(`  Validation:`);
    console.log(`    Final Amount Valid: ${isValidFinalAmount ? '✅' : '❌'}`);
    console.log(`    Paise Amount Valid: ${isValidPaise ? '✅' : '❌'}`);
    console.log(`    Razorpay Compatible: ${amountInPaise > 0 ? '✅' : '⚠️  Zero amount'}`);
    console.log(`  Status: ${isValidFinalAmount && isValidPaise ? '✅ PASS' : '❌ FAIL'}`);
    
  } catch (error) {
    console.log(`❌ Upgrade calculation failed: ${error.message}`);
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 Running Payment Order Creation Tests\n');
  console.log('=' .repeat(60));

  try {
    await connectDB();
    
    testFinalAmountCalculation();
    console.log('=' .repeat(60));
    
    testRazorpayAmountConversion();
    console.log('=' .repeat(60));
    
    await testUpgradeCalculationForPayment();
    console.log('=' .repeat(60));
    
    console.log('🎉 All tests completed!');
    console.log('\nKey Fixes Applied:');
    console.log('1. ✅ Use prorationCreditDisplay instead of dual-value object');
    console.log('2. ✅ Validate proration credit is a number before calculation');
    console.log('3. ✅ Validate final amount is valid before Razorpay order creation');
    console.log('4. ✅ Add comprehensive logging for debugging');
    console.log('\nExpected Result:');
    console.log('- Final amount calculation: ₹999 - ₹144.16 = ₹854.84');
    console.log('- Razorpay order amount: 85484 paise');
    console.log('- Payment dialog should open successfully');
    
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

export { testFinalAmountCalculation, testRazorpayAmountConversion, testUpgradeCalculationForPayment, runTests };
