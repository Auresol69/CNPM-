import axios from 'axios';
import fs from 'fs';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

const adminCreds = {
    username: "123123",
    password: "123"
};

async function probeApi() {
    const logFile = 'probe_result.txt';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n', 'utf8');
    };

    // Clear previous log
    fs.writeFileSync(logFile, '', 'utf8');

    try {
        log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/signin`, adminCreds);
        const token = loginRes.data.accessToken;
        
        if (!token) {
            log('No token received');
            process.exit(1);
        }
        log('Login successful. Token received.');

        const headers = { Authorization: `Bearer ${token}` };

        const endpoints = [
            '/students',
            '/students/my-students',
            '/parents/students',
            '/parents/me/students',
            '/users/me'
        ];

        for (const endpoint of endpoints) {
            log(`\nTesting endpoint: ${endpoint}`);
            try {
                const res = await axios.get(`${API_URL}${endpoint}`, { headers });
                log(`✅ Success [${res.status}]: ${JSON.stringify(res.data).substring(0, 200)}...`);
            } catch (err) {
                log(`❌ Failed [${err.response?.status}]: ${err.response?.statusText}`);
            }
        }

    } catch (error) {
        log(`Fatal error: ${error.message}`);
        process.exit(1);
    }
}

probeApi();
