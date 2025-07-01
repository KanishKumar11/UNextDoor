import config from './src/config/index.js';
import mongoose from 'mongoose';
import PaymentOrder from './src/models/PaymentOrder.js';
import User from './src/models/User.js';
import RazorpayGateway from './src/services/payment/gateways/RazorpayGateway.js';

async function createTestOrder() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ email: 'keenkanish@gmail.com' });
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    console.log('✅ Found user:', user.email);

    // Initialize Razorpay
    const razorpay = new RazorpayGateway();

    // Create Razorpay order for standard plan
    const amountInPaise = 29900; // ₹299 for standard plan
    const razorpayOrder = await razorpay.createOrder(
      amountInPaise,
      'INR',
      {
        receipt: `test_${Date.now().toString().slice(-10)}`,
        notes: {
          userId: user._id.toString(),
          planId: 'standard_monthly',
          subscriptionType: 'upgrade',
          prorationCredit: '0'
        }
      }
    );

    if (!razorpayOrder.success) {
      console.log('❌ Failed to create Razorpay order:', razorpayOrder.error);
      return;
    }

    console.log('✅ Razorpay order created:', razorpayOrder.data.id);

    // Create payment order in database
    const orderId = `ord_${Date.now()}_${user._id.toString().slice(-8)}`;
    const paymentOrder = new PaymentOrder({
      userId: user._id,
      planId: 'standard_monthly',
      orderId,
      razorpayOrderId: razorpayOrder.data.id,
      amount: 299,
      originalAmount: 299,
      currency: 'INR',
      status: 'created',
      planDetails: {
        id: 'basic_monthly',
        name: 'Basic Monthly',
        price: 149,
        currency: 'INR',
        currencySymbol: '₹',
        interval: 'month',
        intervalCount: 1,
        features: ['Unlimited lessons', 'AI tutor access', 'Progress tracking']
      },
      userDetails: {
        name: user.name || user.email,
        email: user.email,
        contact: user.phone || ''
      },
      prorationCredit: 0,
      metadata: new Map([
        ['testOrder', 'true'],
        ['createdAt', new Date().toISOString()]
      ])
    });

    await paymentOrder.save();
    console.log('✅ Payment order created:', orderId);

    // Generate test URLs
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWU0MjVmYWU5MDQwMWI4ZGU5N2M1NyIsImVtYWlsIjoia2VlbmthbmlzaEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTEyMDkzMDIsImV4cCI6MTc1MTgxNDEwMn0.Hqmi8Yn9cFDTv2UZS1X7cpjfCbJXt7IQXVfDKXkkxbc';
    
    console.log('\n🔗 Test URLs:');
    console.log('Payment Page:', `http://192.168.1.5:5001/api/v1/subscriptions/payment-page/${orderId}?token=${testToken}`);
    console.log('Payment Details API:', `http://192.168.1.5:5001/api/v1/subscriptions/payment-details/${orderId}?token=${testToken}`);
    
    console.log('\n📋 Order Details:');
    console.log('Order ID:', orderId);
    console.log('Razorpay Order ID:', razorpayOrder.data.id);
    console.log('Amount: ₹149');
    console.log('Status: created');

  } catch (error) {
    console.error('❌ Error creating test order:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createTestOrder();
