/**
 * Test script for upgrade pricing fixes
 * 
 * This script tests the backend pricing logic to ensure:
 * 1. getPlanDetails returns correct prices for each plan
 * 2. Upgrade preview API returns valid pricing data
 * 3. All plans have different prices (not all the same)
 */

import mongoose from 'mongoose';
import config from '../config/index.js';
import SubscriptionController from '../controllers/subscriptionController.js';
import { PLAN_PRICES, getPlanPrice, getUserCurrency } from '../utils/currencyUtils.js';

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
 * Test getPlanDetails method for all plans
 */
async function testGetPlanDetails() {
  console.log('🧪 Testing getPlanDetails method...\n');

  const controller = new SubscriptionController();
  const plans = ['basic_monthly', 'standard_quarterly', 'pro_yearly'];
  
  // Test with different request scenarios
  const testScenarios = [
    {
      name: 'No Request (INR Default)',
      req: null,
      expectedCurrency: 'INR'
    },
    {
      name: 'USD Request',
      req: {
        headers: {
          'accept-language': 'en-US',
          'cf-ipcountry': 'US'
        }
      },
      expectedCurrency: 'USD'
    },
    {
      name: 'INR Request',
      req: {
        headers: {
          'accept-language': 'hi-IN',
          'cf-ipcountry': 'IN'
        }
      },
      expectedCurrency: 'INR'
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`📋 Testing scenario: ${scenario.name}`);
    
    for (const planId of plans) {
      try {
        const planDetails = await controller.getPlanDetails(planId, scenario.req);
        
        console.log(`  ${planId}:`);
        console.log(`    Price: ${planDetails.price}`);
        console.log(`    Currency: ${planDetails.currency}`);
        console.log(`    Symbol: ${planDetails.currencySymbol}`);
        
        // Validate pricing
        const expectedPrice = scenario.req ? 
          PLAN_PRICES[planId][scenario.expectedCurrency] : 
          PLAN_PRICES[planId].INR;
        
        const isCorrect = Math.abs(planDetails.price - expectedPrice) < 0.01;
        console.log(`    Expected: ${expectedPrice} ${scenario.expectedCurrency}`);
        console.log(`    Status: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
      } catch (error) {
        console.log(`    ❌ ERROR: ${error.message}`);
      }
    }
    console.log('');
  }
}

/**
 * Test that all plans have different prices
 */
async function testPlanPriceDifferences() {
  console.log('🔍 Testing plan price differences...\n');

  const controller = new SubscriptionController();
  const plans = ['basic_monthly', 'standard_quarterly', 'pro_yearly'];
  
  // Test with USD request
  const mockReq = {
    headers: {
      'accept-language': 'en-US',
      'cf-ipcountry': 'US'
    }
  };

  const planPrices = {};
  
  for (const planId of plans) {
    try {
      const planDetails = await controller.getPlanDetails(planId, mockReq);
      planPrices[planId] = planDetails.price;
      console.log(`${planId}: $${planDetails.price}`);
    } catch (error) {
      console.log(`${planId}: ERROR - ${error.message}`);
      planPrices[planId] = null;
    }
  }

  // Check if all prices are different
  const prices = Object.values(planPrices).filter(p => p !== null);
  const uniquePrices = [...new Set(prices)];
  
  console.log(`\nPrice Analysis:`);
  console.log(`  Total plans: ${plans.length}`);
  console.log(`  Valid prices: ${prices.length}`);
  console.log(`  Unique prices: ${uniquePrices.length}`);
  
  if (uniquePrices.length === prices.length && prices.length === plans.length) {
    console.log(`  Status: ✅ All plans have different prices`);
  } else {
    console.log(`  Status: ❌ Some plans have duplicate prices`);
    console.log(`  Prices: [${prices.join(', ')}]`);
  }
}

/**
 * Test PLAN_PRICES configuration
 */
function testPlanPricesConfig() {
  console.log('📊 Testing PLAN_PRICES configuration...\n');

  const plans = ['basic_monthly', 'standard_quarterly', 'pro_yearly'];
  
  for (const planId of plans) {
    console.log(`${planId}:`);
    
    if (PLAN_PRICES[planId]) {
      console.log(`  INR: ₹${PLAN_PRICES[planId].INR}`);
      console.log(`  USD: $${PLAN_PRICES[planId].USD}`);
      console.log(`  Status: ✅ Configuration exists`);
    } else {
      console.log(`  Status: ❌ Configuration missing`);
    }
    console.log('');
  }

  // Check for price progression (basic < standard < pro)
  const inrPrices = plans.map(planId => PLAN_PRICES[planId]?.INR || 0);
  const usdPrices = plans.map(planId => PLAN_PRICES[planId]?.USD || 0);
  
  const inrProgression = inrPrices[0] < inrPrices[1] && inrPrices[1] < inrPrices[2];
  const usdProgression = usdPrices[0] < usdPrices[1] && usdPrices[1] < usdPrices[2];
  
  console.log('Price Progression Analysis:');
  console.log(`  INR: ${inrPrices.join(' < ')} = ${inrProgression ? '✅ CORRECT' : '❌ INCORRECT'}`);
  console.log(`  USD: ${usdPrices.join(' < ')} = ${usdProgression ? '✅ CORRECT' : '❌ INCORRECT'}`);
}

/**
 * Test currency utilities
 */
function testCurrencyUtilities() {
  console.log('\n🔧 Testing currency utilities...\n');

  const plans = ['basic_monthly', 'standard_quarterly', 'pro_yearly'];
  
  // Mock requests for different currencies
  const mockRequests = [
    {
      name: 'USD Request',
      req: { headers: { 'cf-ipcountry': 'US' } }
    },
    {
      name: 'INR Request', 
      req: { headers: { 'cf-ipcountry': 'IN' } }
    }
  ];

  for (const mockReq of mockRequests) {
    console.log(`Testing ${mockReq.name}:`);
    
    try {
      const currency = getUserCurrency(mockReq.req);
      console.log(`  Detected currency: ${currency.code} (${currency.symbol})`);
      
      for (const planId of plans) {
        try {
          const priceInfo = getPlanPrice(planId, mockReq.req);
          console.log(`    ${planId}: ${priceInfo.symbol}${priceInfo.amount}`);
        } catch (error) {
          console.log(`    ${planId}: ERROR - ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`  ERROR: ${error.message}`);
    }
    console.log('');
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🚀 Running Upgrade Pricing Tests\n');
  console.log('=' .repeat(60));

  try {
    await connectDB();
    
    testPlanPricesConfig();
    console.log('=' .repeat(60));
    
    testCurrencyUtilities();
    console.log('=' .repeat(60));
    
    await testGetPlanDetails();
    console.log('=' .repeat(60));
    
    await testPlanPriceDifferences();
    console.log('=' .repeat(60));
    
    console.log('🎉 All tests completed!');
    
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

export { testGetPlanDetails, testPlanPriceDifferences, testPlanPricesConfig, testCurrencyUtilities };
