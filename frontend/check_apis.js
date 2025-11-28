import axios from 'axios';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

const adminCreds = {
    username: "123123",
    password: "123"
};

const endpoints = [
    { name: 'Routes (Lộ trình)', path: '/routes' },
    { name: 'Buses (Xe buýt)', path: '/buses' },
    { name: 'Notifications (Thông báo)', path: '/notifications' },
    { name: 'Students (Học sinh)', path: '/students' },
    { name: 'Schedules (Lịch trình)', path: '/schedules' },
    { name: 'Trips (Chuyến đi)', path: '/trips' },
    { name: 'Stations (Trạm dừng)', path: '/stations' }
];

async function checkApis() {
    console.log('--- KIỂM TRA TOÀN BỘ API (Với quyền Admin) ---');

    try {
        // 1. Login
        console.log('1. Đang đăng nhập...');
        const loginRes = await axios.post(`${API_URL}/auth/signin`, adminCreds);
        const token = loginRes.data.accessToken;
        
        if (!token) {
            console.log('❌ Không lấy được Token. Dừng kiểm tra.');
            return;
        }
        console.log('✅ Đăng nhập OK. Token sẵn sàng.');

        // 2. Check Endpoints
        console.log('\n2. Kiểm tra các Endpoint:');
        console.log('--------------------------------------------------');
        
        for (const ep of endpoints) {
            try {
                const res = await axios.get(`${API_URL}${ep.path}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                let count = 'N/A';
                if (Array.isArray(res.data)) count = res.data.length;
                else if (res.data.data && Array.isArray(res.data.data)) count = res.data.data.length;
                else if (res.data.results) count = res.data.results;

                console.log(`✅ ${ep.name.padEnd(25)}: OK (200) - ${count} items`);
            } catch (err) {
                console.log(`❌ ${ep.name.padEnd(25)}: LỖI (${err.response?.status || 'Unknown'}) - ${err.message}`);
            }
        }
        console.log('--------------------------------------------------');

    } catch (error) {
        console.log('❌ Lỗi Fatal:', error.message);
    }
}

checkApis();
