import axios from 'axios';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

async function testLogin() {
  try {
    console.log('Testing login for 012012...');
    const res = await axios.post(`${API_URL}/auth/signin`, {
      username: '012012',
      password: '123'
    });
    console.log('Login SUCCESS!');
    console.log('Token:', res.data.token ? 'Received' : 'Missing');
    console.log('User Role:', res.data.data.user.role);
  } catch (error) {
    console.error('Login FAILED:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testLogin();
