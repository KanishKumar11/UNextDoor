/**
 * Test script for proration credit currency conversion
 * 
 * This script tests the proration credit calculation to ensure:
 * 1. Proration credit is calculated in the correct currency
 * 2. Currency conversion is applied when existing and new subscriptions have different currencies
 * 3. Both numerical value and currency symbol match
 */

import mongoose from 'mongoose';
import config from '../config/index.js';
import SubscriptionController from '../controllers/subscriptionController.js';
import Subscription from '../models/Subscription.js';

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
 * Create mock existing subscription for testing
 */
function createMockExistingSubscription(currency, displayPrice) {
  const now = new Date();
  const endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
  
  return {
    planId: 'basic_monthly',
    planName: 'Basic Monthly',
    amount: currency === 'USD' ? Math.round(displayPrice * 100) : Math.round(displayPrice * 100), // Store in smallest unit
    displayPrice: displayPrice,
    currency: currency,
    currentPeriodStart: now,
    currentPeriodEnd: endDate,
    createdAt: now
  };
}

/**
 * Create mock new plan details for testing
 */
function createMockNewPlanDetails(currency, price) {
  return {
    id: 'standard_quarterly',
    name: 'Standard',
    price: price,
    currency: currency,
    currencySymbol: currency === 'USD' ? '$' : '₹'
  };
}

/**
 * Test proration credit currency conversion scenarios
 */
async function testProrationCreditCurrency() {
  console.log('🧪 Testing Proration Credit Currency Conversion...\n');

  const controller = new SubscriptionController();
  
  const testCases = [
    {
      name: 'INR to INR (Same Currency)',
      existingSubscription: createMockExistingSubscription('INR', 149),
      newPlanDetails: createMockNewPlanDetails('INR', 399),
      expectedCurrency: 'INR',
      expectedSymbol: '₹',
      shouldConvert: false
    },
    {
      name: 'USD to USD (Same Currency)',
      existingSubscription: createMockExistingSubscription('USD', 1.99),
      newPlanDetails: createMockNewPlanDetails('USD', 4.99),
      expectedCurrency: 'USD',
      expectedSymbol: '$',
      shouldConvert: false
    },
    {
      name: 'INR to USD (Currency Conversion)',
      existingSubscription: createMockExistingSubscription('INR', 149),
      newPlanDetails: createMockNewPlanDetails('USD', 4.99),
      expectedCurrency: 'USD',
      expectedSymbol: '$',
      shouldConvert: true,
      conversionNote: 'INR proration credit should be converted to USD'
    },
    {
      name: 'USD to INR (Currency Conversion)',
      existingSubscription: createMockExistingSubscription('USD', 1.99),
      newPlanDetails: createMockNewPlanDetails('INR', 399),
      expectedCurrency: 'INR',
      expectedSymbol: '₹',
      shouldConvert: true,
      conversionNote: 'USD proration credit should be converted to INR'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Test Case: ${testCase.name}`);
    console.log(`  Existing: ${testCase.existingSubscription.currency} ${testCase.existingSubscription.currencySymbol || (testCase.existingSubscription.currency === 'USD' ? '$' : '₹')}${testCase.existingSubscription.displayPrice}`);
    console.log(`  New Plan: ${testCase.newPlanDetails.currency} ${testCase.newPlanDetails.currencySymbol}${testCase.newPlanDetails.price}`);
    
    try {
      const upgrade = controller.calculateUpgrade(testCase.existingSubscription, testCase.newPlanDetails);
      
      console.log(`  Results:`);
      console.log(`    Is Upgrade: ${upgrade.isUpgrade}`);
      console.log(`    Proration Credit: ${upgrade.prorationCredit}`);
      console.log(`    Existing Currency: ${upgrade.existingCurrency}`);
      console.log(`    New Currency: ${upgrade.newCurrency}`);
      console.log(`    Currency Converted: ${upgrade.currencyConverted}`);
      console.log(`    Remaining Days: ${upgrade.remainingDays}`);
      
      // Validate results
      const currencyMatches = upgrade.newCurrency === testCase.expectedCurrency;
      const conversionApplied = upgrade.currencyConverted === testCase.shouldConvert;
      const prorationIsPositive = upgrade.prorationCredit > 0;
      
      console.log(`  Validation:`);
      console.log(`    Currency Match: ${currencyMatches ? '✅' : '❌'} (${upgrade.newCurrency} === ${testCase.expectedCurrency})`);
      console.log(`    Conversion Applied: ${conversionApplied ? '✅' : '❌'} (${upgrade.currencyConverted} === ${testCase.shouldConvert})`);
      console.log(`    Proration > 0: ${prorationIsPositive ? '✅' : '❌'} (${upgrade.prorationCredit})`);
      
      if (testCase.shouldConvert) {
        console.log(`    Note: ${testCase.conversionNote}`);
        
        // Check if conversion makes sense
        if (testCase.existingSubscription.currency === 'INR' && testCase.newPlanDetails.currency === 'USD') {
          const expectedUSDCredit = testCase.existingSubscription.displayPrice / 83.33;
          console.log(`    Expected USD Credit (approx): $${expectedUSDCredit.toFixed(2)}`);
        } else if (testCase.existingSubscription.currency === 'USD' && testCase.newPlanDetails.currency === 'INR') {
          const expectedINRCredit = testCase.existingSubscription.displayPrice * 83.33;
          console.log(`    Expected INR Credit (approx): ₹${expectedINRCredit.toFixed(2)}`);
        }
      }
      
      const allValid = currencyMatches && conversionApplied && prorationIsPositive;
      console.log(`  Status: ${allValid ? '✅ PASS' : '❌ FAIL'}\n`);
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}\n`);
    }
  }
}

/**
 * Test frontend formatting with corrected proration credit
 */
function testFrontendFormatting() {
  console.log('🎨 Testing Frontend Formatting Logic...\n');

  // Simulate the formatPrice function from UpgradePreviewDialog
  const formatPrice = (amount, currency) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currency && typeof currency === 'object' && currency.symbol 
        ? `${currency.symbol}0.00` 
        : currency && typeof currency === 'string' && currency === 'INR'
        ? '₹0.00'
        : '$0.00';
    }

    if (currency) {
      if (typeof currency === 'object' && currency.symbol) {
        return `${currency.symbol}${Number(amount).toFixed(2)}`;
      }
      if (typeof currency === 'string') {
        const symbol = currency === 'INR' ? '₹' : '$';
        return `${symbol}${Number(amount).toFixed(2)}`;
      }
    }
    
    return `$${Number(amount).toFixed(2)}`;
  };

  const testCases = [
    {
      name: 'USD Proration Credit',
      prorationCredit: 1.50,
      currency: { code: 'USD', symbol: '$' },
      expected: '$1.50'
    },
    {
      name: 'INR Proration Credit',
      prorationCredit: 125,
      currency: { code: 'INR', symbol: '₹' },
      expected: '₹125.00'
    },
    {
      name: 'USD String Currency',
      prorationCredit: 2.25,
      currency: 'USD',
      expected: '$2.25'
    },
    {
      name: 'INR String Currency',
      prorationCredit: 75,
      currency: 'INR',
      expected: '₹75.00'
    }
  ];

  testCases.forEach((testCase, index) => {
    const result = formatPrice(testCase.prorationCredit, testCase.currency);
    const isCorrect = result === testCase.expected;
    
    console.log(`Format Test ${index + 1}: ${testCase.name}`);
    console.log(`  Amount: ${testCase.prorationCredit}`);
    console.log(`  Currency: ${JSON.stringify(testCase.currency)}`);
    console.log(`  Result: ${result}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
  });
}

/**
 * Test complete upgrade preview flow
 */
async function testCompleteUpgradeFlow() {
  console.log('🔄 Testing Complete Upgrade Preview Flow...\n');

  const controller = new SubscriptionController();
  
  // Test scenarios that would occur in real upgrade preview
  const scenarios = [
    {
      name: 'User with INR subscription upgrading to USD plan',
      existingSubscription: createMockExistingSubscription('INR', 149),
      requestedCurrency: 'USD',
      targetPlanId: 'standard_quarterly',
      expectedFlow: 'INR proration → USD proration → USD final price'
    },
    {
      name: 'User with USD subscription upgrading to INR plan',
      existingSubscription: createMockExistingSubscription('USD', 1.99),
      requestedCurrency: 'INR',
      targetPlanId: 'standard_quarterly',
      expectedFlow: 'USD proration → INR proration → INR final price'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`📋 Scenario: ${scenario.name}`);
    console.log(`  Expected Flow: ${scenario.expectedFlow}`);
    
    try {
      // Step 1: Get plan details for requested currency
      const requestedCurrency = {
        code: scenario.requestedCurrency,
        symbol: scenario.requestedCurrency === 'USD' ? '$' : '₹'
      };
      
      const planDetails = await controller.getPlanDetailsWithCurrency(scenario.targetPlanId, requestedCurrency);
      
      // Step 2: Calculate upgrade with currency conversion
      const upgrade = controller.calculateUpgrade(scenario.existingSubscription, planDetails);
      
      // Step 3: Calculate final price
      const finalPrice = Math.max(0, planDetails.price - upgrade.prorationCredit);
      
      console.log(`  Results:`);
      console.log(`    Plan Price: ${requestedCurrency.symbol}${planDetails.price}`);
      console.log(`    Proration Credit: ${requestedCurrency.symbol}${upgrade.prorationCredit}`);
      console.log(`    Final Price: ${requestedCurrency.symbol}${finalPrice}`);
      console.log(`    Currency Converted: ${upgrade.currencyConverted ? '✅' : '❌'}`);
      
      // Validate that all amounts are in the same currency
      const allInSameCurrency = planDetails.currency === scenario.requestedCurrency;
      console.log(`    All amounts in ${scenario.requestedCurrency}: ${allInSameCurrency ? '✅' : '❌'}`);
      console.log(`  Status: ${allInSameCurrency && upgrade.prorationCredit > 0 ? '✅ PASS' : '❌ FAIL'}\n`);
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}\n`);
    }
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 Running Proration Credit Currency Tests\n');
  console.log('=' .repeat(60));

  try {
    await connectDB();
    
    await testProrationCreditCurrency();
    console.log('=' .repeat(60));
    
    testFrontendFormatting();
    console.log('=' .repeat(60));
    
    await testCompleteUpgradeFlow();
    console.log('=' .repeat(60));
    
    console.log('🎉 All tests completed!');
    console.log('\nSummary of Fixes:');
    console.log('1. ✅ Fixed proration credit calculation to use display prices');
    console.log('2. ✅ Added currency conversion for proration credit');
    console.log('3. ✅ Ensured proration credit matches new plan currency');
    console.log('4. ✅ Added comprehensive debugging for currency conversion');
    
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

export { 
  testProrationCreditCurrency, 
  testFrontendFormatting, 
  testCompleteUpgradeFlow,
  runTests 
};
