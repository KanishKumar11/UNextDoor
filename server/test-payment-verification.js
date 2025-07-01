import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Test payment verification with proper signature
function generateValidSignature(orderId, paymentId) {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  return expectedSignature;
}

// Test data - using Razorpay order ID that exists in our database
const testOrderId = "order_Qn3z3ZO91dFBAR"; // Razorpay order ID from our database
const testPaymentId = "pay_test123456789";
const validSignature = generateValidSignature(testOrderId, testPaymentId);

console.log('Test Payment Verification Data:');
console.log('Order ID:', testOrderId);
console.log('Payment ID:', testPaymentId);
console.log('Valid Signature:', validSignature);

// Create the test payload
const testPayload = {
  razorpay_order_id: testOrderId,
  razorpay_payment_id: testPaymentId,
  razorpay_signature: validSignature
};

console.log('\nTest Payload:');
console.log(JSON.stringify(testPayload, null, 2));

// Create curl command for testing
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWU0MjVmYWU5MDQwMWI4ZGU5N2M1NyIsImVtYWlsIjoia2VlbmthbmlzaEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTEyMDkzMDIsImV4cCI6MTc1MTgxNDEwMn0.Hqmi8Yn9cFDTv2UZS1X7cpjfCbJXt7IQXVfDKXkkxbc";

console.log('\nPowerShell Command:');
console.log(`Invoke-RestMethod -Uri "http://localhost:5001/api/v1/subscriptions/verify-payment" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer ${token}"} -Body '${JSON.stringify(testPayload)}'`);
