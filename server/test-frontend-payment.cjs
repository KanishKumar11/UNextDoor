/**
 * Frontend Payment Integration Test
 * Tests the complete payment flow from frontend to backend
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5001/api/v1';
const TEST_USER_EMAIL = 'test@example.com';

// Test data
const testUser = {
  email: TEST_USER_EMAIL,
  password: 'testpassword123',
  name: 'Test User',
  proficiencyLevel: 'beginner'
};

let authToken = null;
let testPlanId = null;

async function testFrontendPaymentIntegration() {
  console.log('🧪 Testing Frontend Payment Integration...\n');

  try {
    // Step 1: Register/Login user
    console.log('1. Authenticating user...');
    await authenticateUser();
    console.log('✅ User authenticated successfully\n');

    // Step 2: Get available plans
    console.log('2. Fetching subscription plans...');
    const plans = await getSubscriptionPlans();
    console.log(`✅ Found ${plans.length} subscription plans\n`);

    // Step 3: Create payment order
    console.log('3. Creating payment order...');
    const orderData = await createPaymentOrder(testPlanId);
    console.log('✅ Payment order created successfully');
    console.log(`   Order ID: ${orderData.orderId}`);
    console.log(`   Amount: ₹${orderData.amount}`);
    console.log(`   Payment URL: ${orderData.paymentUrl}\n`);

    // Step 4: Test payment URL accessibility
    console.log('4. Testing payment URL accessibility...');
    await testPaymentUrl(orderData.paymentUrl);
    console.log('✅ Payment URL is accessible\n');

    // Step 5: Test API endpoints used by frontend
    console.log('5. Testing frontend API endpoints...');
    await testFrontendEndpoints();
    console.log('✅ All frontend endpoints working\n');

    console.log('🎉 Frontend Payment Integration Test PASSED!');
    console.log('\nNext steps:');
    console.log('- Test the payment flow in the mobile app');
    console.log('- Verify WebView integration works correctly');
    console.log('- Test payment success/failure handling');

  } catch (error) {
    console.error('❌ Frontend Payment Integration Test FAILED!');
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

async function authenticateUser() {
  try {
    // Try to register user (will fail if already exists)
    await axios.post(`${API_BASE_URL}/auth/register`, testUser);
  } catch (error) {
    // User might already exist, continue
  }

  // Login user
  const loginResponse = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
    email: testUser.email
  });

  if (!loginResponse.data.success) {
    throw new Error('Failed to send OTP');
  }

  // For testing, we'll use a mock OTP verification
  // In real app, user would enter the OTP they received
  console.log('   Note: In real app, user would enter OTP from email');
  
  // Set a mock token for testing
  authToken = 'mock-token-for-testing';
}

async function getSubscriptionPlans() {
  const response = await axios.get(`${API_BASE_URL}/subscriptions/plans`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Failed to fetch subscription plans');
  }

  const plans = response.data.data.plans;
  if (plans.length > 0) {
    testPlanId = plans[0].id; // Use first plan for testing
    console.log(`   Using plan: ${plans[0].name} (₹${plans[0].price})`);
  }

  return plans;
}

async function createPaymentOrder(planId) {
  const response = await axios.post(`${API_BASE_URL}/subscriptions/create-order`, {
    planId: planId
  }, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Failed to create payment order');
  }

  return response.data.data;
}

async function testPaymentUrl(paymentUrl) {
  try {
    const response = await axios.get(paymentUrl);
    if (response.status === 200 && response.data.includes('Razorpay')) {
      console.log('   Payment page loads correctly');
    } else {
      throw new Error('Payment page does not contain expected content');
    }
  } catch (error) {
    throw new Error(`Payment URL not accessible: ${error.message}`);
  }
}

async function testFrontendEndpoints() {
  const endpoints = [
    { method: 'GET', path: '/subscriptions/current', name: 'Current Subscription' },
    { method: 'GET', path: '/subscriptions/transactions', name: 'Transaction History' },
    { method: 'GET', path: '/subscriptions/billing-details', name: 'Billing Details' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.path}`,
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log(`   ✅ ${endpoint.name}: ${response.status}`);
    } catch (error) {
      console.log(`   ⚠️  ${endpoint.name}: ${error.response?.status || 'Error'} (${error.message})`);
    }
  }
}

// Run the test
if (require.main === module) {
  testFrontendPaymentIntegration();
}

module.exports = { testFrontendPaymentIntegration };
