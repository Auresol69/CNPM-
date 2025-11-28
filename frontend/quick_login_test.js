import axios from 'axios';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

async function testLogin() {
    try {
        console.log('Testing login with username: 123123, password: 123');
        
        const response = await axios.post(`${API_URL}/auth/signin`, {
            username: "123123",
            password: "123"
        });
        
        console.log('✅ SUCCESS! Response:', response.data);
        console.log('Access Token:', response.data.accessToken);
        
    } catch (error) {
        console.error('❌ ERROR!');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', error.response?.data);
        console.error('Full Error:', error.message);
    }
}

testLogin();
