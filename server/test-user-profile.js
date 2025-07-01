import axios from 'axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWU0MjVmYWU5MDQwMWI4ZGU5N2M1NyIsImVtYWlsIjoia2VlbmthbmlzaEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTEyMDkzMDIsImV4cCI6MTc1MTgxNDEwMn0.Hqmi8Yn9cFDTv2UZS1X7cpjfCbJXt7IQXVfDKXkkxbc';

async function testUserProfile() {
  try {
    console.log('Testing user profile API...');
    
    const response = await axios.get('http://localhost:5001/api/v1/auth/profile', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User Profile Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if subscription fields are present
    const user = response.data.data?.user || response.data.user;
    if (user) {
      console.log('\n📋 Subscription Fields Check:');
      console.log(`currentSubscriptionId: ${user.currentSubscriptionId || 'NOT PRESENT'}`);
      console.log(`subscriptionStatus: ${user.subscriptionStatus || 'NOT PRESENT'}`);
      console.log(`subscriptionTier: ${user.subscriptionTier || 'NOT PRESENT'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUserProfile();
