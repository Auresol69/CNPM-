import axios from 'axios';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

async function testParentLogin() {
    console.log('=== TESTING PARENT LOGIN ===\n');
    
    // Test 1: Parent account
    try {
        console.log('Testing Parent Account:');
        console.log('Username: 012012');
        console.log('Password: 123\n');
        
        const response = await axios.post(`${API_URL}/auth/signin`, {
            username: "012012",
            password: "123"
        });
        
        console.log('✅ LOGIN SUCCESS!');
        console.log('Access Token:', response.data.accessToken);
        console.log('User Data:', JSON.stringify(response.data.data, null, 2));
        
        // Test getting user info
        const token = response.data.accessToken;
        try {
            const userInfo = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('\n✅ User Info Retrieved:');
            console.log(JSON.stringify(userInfo.data, null, 2));
        } catch (err) {
            console.log('\n⚠️ Could not get user info:', err.response?.data || err.message);
        }
        
    } catch (error) {
        console.error('❌ LOGIN FAILED!');
        console.error('Status:', error.response?.status);
        console.error('Error Message:', error.response?.data?.message || error.message);
        console.error('Full Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

testParentLogin();
