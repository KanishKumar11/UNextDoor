import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text, Heading, ModernButton, Row, Column, Spacer } from '../index';

const { width, height } = Dimensions.get('window');

const RazorpayPaymentDialog = ({
  visible,
  onClose,
  orderDetails,
  planDetails,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const { theme } = useTheme();
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('webview'); // 'review', 'webview', 'processing', 'success', 'failed'
  const [webViewUrl, setWebViewUrl] = useState('');
  const webViewRef = useRef(null);

  // Debug logging
  console.log('💳 RazorpayPaymentDialog props:', {
    visible,
    orderDetails,
    planDetails,
    paymentStep
  });

  // Initialize webview URL when component mounts or orderDetails change
  useEffect(() => {
    if (visible && orderDetails && paymentStep === 'webview') {
      const webUrl = createRazorpayWebCheckout();
      console.log('🌐 Initializing WebView URL:', webUrl?.substring(0, 100) + '...');
      setWebViewUrl(webUrl);
    }
  }, [visible, orderDetails, paymentStep]);

  // Safety check - don't render if essential data is missing
  if (!visible || !orderDetails) {
    console.log('❌ Payment dialog not rendering - missing data:', { visible, orderDetails });
    return null;
  }

  const createRazorpayWebCheckout = () => {
    console.log('🔗 Checking for payment URL:', orderDetails?.paymentUrl);

    // Use the server's payment URL instead of embedded HTML
    if (orderDetails?.paymentUrl) {
      console.log('✅ Using server payment URL:', orderDetails.paymentUrl);
      return orderDetails.paymentUrl;
    }

    console.log('⚠️ No payment URL found, generating fallback HTML...');

    // Fallback: Create HTML content with Razorpay web checkout
    const checkoutOptions = {
      key: 'rzp_test_MN5MbjJNNsu5zY', // Your Razorpay key
      amount: (orderDetails?.amount || 0) * 100, // Amount in paise
      currency: 'INR',
      name: 'UNextDoor',
      description: `${planDetails?.name || 'Subscription'} Plan Subscription`,
      order_id: orderDetails?.orderId || '',
      theme: {
        color: '#6FC935' // Updated to match user's brand color
      },
      prefill: {
        email: 'user@example.com',
        contact: '9999999999',
        name: 'User Name'
      }
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Payment - UNextDoor</title>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            box-sizing: border-box;
          }
          .container {
            text-align: center;
            padding: 32px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 400px;
            width: 100%;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: #2ECC71;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            font-weight: bold;
          }
          .plan-name {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #2ECC71;
            margin: 16px 0;
          }
          .description {
            color: #666;
            margin-bottom: 24px;
            line-height: 1.5;
          }
          .pay-button {
            background: #2ECC71;
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
          }
          .pay-button:hover {
            background: #27AE60;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
          }
          .secure-text {
            font-size: 12px;
            color: #999;
            margin-top: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
          .loading {
            display: none;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #666;
          }
          .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #2ECC71;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">U</div>
          <div class="plan-name">${planDetails?.name || 'Subscription'} Plan</div>
          <div class="amount">₹${orderDetails?.amount || 0}</div>
          <div class="description">
            Upgrade to ${planDetails?.name || 'premium'} and unlock all premium features
          </div>
          <button class="pay-button" onclick="startPayment()" id="payButton">
            Pay Now Securely
          </button>
          <div class="loading" id="loading">
            <div class="spinner"></div>
            Processing payment...
          </div>
          <div class="secure-text">
            🔒 Secured by Razorpay
          </div>
        </div>
        
        <script>
          function showLoading() {
            document.getElementById('payButton').style.display = 'none';
            document.getElementById('loading').style.display = 'flex';
          }
          
          function hideLoading() {
            document.getElementById('payButton').style.display = 'block';
            document.getElementById('loading').style.display = 'none';
          }
          
          function startPayment() {
            showLoading();
            
            const options = ${JSON.stringify(checkoutOptions)};
            options.handler = function(response) {
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_success',
                data: {
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature
                }
              }));
            };
            
            options.modal = {
              ondismiss: function() {
                hideLoading();
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_cancelled',
                  data: { error: 'Payment cancelled by user' }
                }));
              }
            };
            
            const rzp = new Razorpay(options);
            
            rzp.on('payment.failed', function(response) {
              hideLoading();
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_failed',
                data: {
                  error: response.error.description || 'Payment failed',
                  code: response.error.code || 'PAYMENT_FAILED'
                }
              }));
            });
            
            try {
              rzp.open();
            } catch (error) {
              hideLoading();
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_failed',
                data: {
                  error: 'Failed to open payment gateway',
                  code: 'GATEWAY_ERROR'
                }
              }));
            }
          }
          
          // Auto-start payment when page loads (optional)
          // setTimeout(startPayment, 1000);
        </script>
      </body>
      </html>
    `;

    return `data:text/html;charset=utf-8;base64,${btoa(htmlContent)}`;
  };

  const handlePayment = () => {
    console.log('🚀 Starting payment process...');
    console.log('📊 Order details:', orderDetails);
    console.log('📋 Plan details:', planDetails);

    setPaymentStep('webview');
    const webUrl = createRazorpayWebCheckout();
    console.log('🌐 Generated WebView URL:', webUrl?.substring(0, 100) + '...');
    setWebViewUrl(webUrl);
  };

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'PAYMENT_SUCCESS':
        case 'payment_success':
          setPaymentStep('success');
          setTimeout(() => {
            onPaymentSuccess(message.data);
            onClose();
          }, 2000);
          break;

        case 'PAYMENT_FAILED':
        case 'payment_failed':
          setPaymentStep('failed');
          setTimeout(() => {
            onPaymentFailure(message.data);
          }, 1500);
          break;

        case 'PAYMENT_CANCELLED':
        case 'payment_cancelled':
          setPaymentStep('review');
          break;

        default:
          console.log('Unknown WebView message:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      setPaymentStep('failed');
      onPaymentFailure({
        error: 'Payment processing error',
        code: 'WEBVIEW_ERROR'
      });
    }
  };

  const handleCancel = () => {
    if (!processing) {
      onClose();
    }
  };

  const renderReviewStep = () => (
    <>
      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Row align="center" style={{ marginBottom: 8 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.brandGreen + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="card" size={24} color={theme.colors.brandGreen} />
          </View>
          <Column style={{ flex: 1 }}>
            <Heading level="h3" style={{ color: theme.colors.brandNavy, marginBottom: 4 }}>
              Complete Payment
            </Heading>
            <Text variant="caption" style={{ color: theme.colors.neutral[600] }}>
              Secure payment powered by Razorpay
            </Text>
          </Column>
        </Row>
      </View>

      {/* Order Summary */}
      <View
        style={{
          backgroundColor: theme.colors.neutral[50],
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text weight="semibold" style={{ color: theme.colors.brandNavy, marginBottom: 12 }}>
          Order Summary
        </Text>
        
        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Text style={{ color: theme.colors.neutral[700] }}>Plan</Text>
          <Text weight="semibold" style={{ color: theme.colors.brandNavy }}>
            {planDetails?.name || 'Subscription Plan'}
          </Text>
        </Row>

        <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
          <Text style={{ color: theme.colors.neutral[700] }}>Duration</Text>
          <Text style={{ color: theme.colors.neutral[700] }}>
            {planDetails?.intervalCount === 3 ? 'Quarterly' :
             planDetails?.intervalCount === 12 ? 'Yearly' : 'Monthly'}
          </Text>
        </Row>

        {orderDetails.prorationCredit > 0 && (
          <Row justify="space-between" align="center" style={{ marginBottom: 8 }}>
            <Text style={{ color: theme.colors.success.main }}>Credit Applied</Text>
            <Text style={{ color: theme.colors.success.main }}>
              -₹{orderDetails.prorationCredit}
            </Text>
          </Row>
        )}
        
        <View style={{ height: 1, backgroundColor: theme.colors.neutral[200], marginVertical: 12 }} />
        
        <Row justify="space-between" align="center">
          <Text weight="semibold" style={{ color: theme.colors.brandNavy }}>
            Total Amount
          </Text>
          <Text weight="bold" style={{ color: theme.colors.brandGreen, fontSize: 18 }}>
            ₹{orderDetails?.amount || 0}
          </Text>
        </Row>
      </View>

      {/* Payment Methods */}
      <View style={{ marginBottom: 24 }}>
        <Text weight="semibold" style={{ color: theme.colors.brandNavy, marginBottom: 12 }}>
          Payment Methods
        </Text>
        
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.neutral[200],
            overflow: 'hidden',
          }}
        >
          {[
            { icon: 'card', label: 'Credit/Debit Card', sublabel: 'Visa, Mastercard, Rupay' },
            { icon: 'phone-portrait', label: 'UPI', sublabel: 'GPay, PhonePe, Paytm' },
            { icon: 'business', label: 'Net Banking', sublabel: 'All major banks' },
            { icon: 'wallet', label: 'Wallets', sublabel: 'Paytm, PhonePe, Amazon Pay' },
          ].map((method, index) => (
            <View
              key={method.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                backgroundColor: theme.colors.brandWhite,
                borderBottomWidth: index < 3 ? 1 : 0,
                borderBottomColor: theme.colors.neutral[100],
              }}
            >
              <Ionicons
                name={method.icon}
                size={20}
                color={theme.colors.brandGreen}
                style={{ marginRight: 12 }}
              />
              <Column style={{ flex: 1 }}>
                <Text weight="medium" style={{ color: theme.colors.brandNavy }}>
                  {method.label}
                </Text>
                <Text variant="caption" style={{ color: theme.colors.neutral[600] }}>
                  {method.sublabel}
                </Text>
              </Column>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.neutral[400]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Security Notice */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: theme.colors.info.main + '10',
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
        }}
      >
        <Ionicons
          name="shield-checkmark"
          size={20}
          color={theme.colors.info.main}
          style={{ marginRight: 8, marginTop: 2 }}
        />
        <Column style={{ flex: 1 }}>
          <Text
            variant="caption"
            weight="medium"
            style={{ color: theme.colors.info.main, marginBottom: 2 }}
          >
            Secure Payment
          </Text>
          <Text variant="caption" style={{ color: theme.colors.neutral[700], lineHeight: 16 }}>
            Your payment is secured with 256-bit SSL encryption. We don't store your card details.
          </Text>
        </Column>
      </View>

      {/* Action Buttons */}
      <Row>
        <ModernButton
          text="Cancel"
          variant="outline"
          size="md"
          onPress={handleCancel}
          style={{
            flex: 1,
            marginRight: 12,
            borderColor: theme.colors.neutral[300],
          }}
          textStyle={{ color: theme.colors.neutral[600] }}
        />
        <ModernButton
          text="Pay Now"
          variant="solid"
          size="md"
          onPress={handlePayment}
          style={{
            flex: 2,
            backgroundColor: theme.colors.brandGreen,
          }}
          textStyle={{ color: theme.colors.brandWhite }}
        />
      </Row>
    </>
  );

  const renderWebViewStep = () => (
    <View style={{ flex: 1, minHeight: height * 0.7 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setPaymentStep('review')}
          style={{
            padding: 8,
            marginRight: 12,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.brandNavy} />
        </TouchableOpacity>
        <Heading level="h3" style={{ color: theme.colors.brandNavy }}>
          Complete Payment
        </Heading>
      </View>
      
      <View style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
        <WebView
          ref={webViewRef}
          source={{ uri: webViewUrl }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.colors.neutral[50]
            }}>
              <ActivityIndicator size="large" color={theme.colors.brandGreen} />
              <Text style={{ marginTop: 12, color: theme.colors.neutral[600] }}>
                Loading payment gateway...
              </Text>
            </View>
          )}
          onLoadStart={() => console.log('WebView loading started')}
          onLoadEnd={() => console.log('WebView loading finished')}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            Alert.alert(
              'Payment Error',
              'Failed to load payment gateway. Please try again.',
              [
                { text: 'Retry', onPress: handlePayment },
                { text: 'Cancel', onPress: () => setPaymentStep('review') }
              ]
            );
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <ActivityIndicator size="large" color={theme.colors.brandGreen} />
      <Spacer size="lg" />
      <Heading level="h3" style={{ color: theme.colors.brandNavy, textAlign: 'center' }}>
        Processing Payment
      </Heading>
      <Text
        style={{
          color: theme.colors.neutral[600],
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 20,
        }}
      >
        Please don't close this window or press back button
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.success.main + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Ionicons name="checkmark-circle" size={48} color={theme.colors.success.main} />
      </View>
      <Heading level="h3" style={{ color: theme.colors.brandNavy, textAlign: 'center' }}>
        Payment Successful!
      </Heading>
      <Text
        style={{
          color: theme.colors.neutral[600],
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 20,
        }}
      >
        Your subscription has been activated successfully
      </Text>
    </View>
  );

  const renderFailedStep = () => (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.error.main + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <Ionicons name="close-circle" size={48} color={theme.colors.error.main} />
      </View>
      <Heading level="h3" style={{ color: theme.colors.brandNavy, textAlign: 'center' }}>
        Payment Failed
      </Heading>
      <Text
        style={{
          color: theme.colors.neutral[600],
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 20,
        }}
      >
        Don't worry, no money was deducted from your account
      </Text>
      <Spacer size="lg" />
      <ModernButton
        text="Try Again"
        variant="solid"
        size="md"
        onPress={() => setPaymentStep('review')}
        style={{
          backgroundColor: theme.colors.brandGreen,
          paddingHorizontal: 32,
        }}
        textStyle={{ color: theme.colors.brandWhite }}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.brandWhite,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: height * 0.95,
            minHeight: height * 0.8,
          }}
        >
          {/* Close Button */}
          {!processing && paymentStep === 'review' && (
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1,
                backgroundColor: theme.colors.neutral[100],
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Ionicons name="close" size={20} color={theme.colors.neutral[600]} />
            </TouchableOpacity>
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {paymentStep === 'review' && renderReviewStep()}
            {paymentStep === 'webview' && renderWebViewStep()}
            {paymentStep === 'processing' && renderProcessingStep()}
            {paymentStep === 'success' && renderSuccessStep()}
            {paymentStep === 'failed' && renderFailedStep()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RazorpayPaymentDialog;
