import axios from 'axios';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

const adminCreds = {
    username: "123123",
    password: "123"
};

async function testAdminAuth() {
    console.log(`--- Kiểm tra tài khoản: ${adminCreds.username} ---`);

    try {
        // 1. Login
        console.log('1. Đang đăng nhập...');
        const loginRes = await axios.post(`${API_URL}/auth/signin`, adminCreds);
        
        if (loginRes.status === 200) {
            console.log('✅ Đăng nhập THÀNH CÔNG!');
            const token = loginRes.data.accessToken;
            console.log('Token:', token ? 'OK' : 'Missing');

            if (token) {
                // 2. Test API Access (Get Routes)
                console.log('\n2. Kiểm tra quyền Admin (Gọi API /routes)...');
                try {
                    const routeRes = await axios.get(`${API_URL}/routes`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('✅ Gọi API /routes THÀNH CÔNG!');
                    console.log('Dữ liệu routes:', Array.isArray(routeRes.data) ? `Có ${routeRes.data.length} routes` : 'Format khác');
                    console.log('👉 Tài khoản này CÓ QUYỀN Admin (hoặc quyền xem routes).');
                } catch (routeErr) {
                    console.log('❌ Gọi API /routes THẤT BẠI:', routeErr.response?.status);
                    if (routeErr.response?.status === 403) {
                        console.log('=> Tài khoản này KHÔNG PHẢI Admin (bị chặn quyền).');
                    }
                    process.exit(1);
                }
            }
        }
    } catch (error) {
        console.log('❌ Đăng nhập thất bại:', error.response?.status);
        console.log('Message:', error.response?.data?.msg || error.response?.data?.message || error.message);
        process.exit(1);
    }
}

testAdminAuth();
