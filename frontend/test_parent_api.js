import axios from 'axios';
import fs from 'fs';

const API_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

const adminCreds = {
    username: "123123",
    password: "123"
};

async function testParentAPIs() {
    const logFile = 'parent_api_test.txt';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n', 'utf8');
    };

    fs.writeFileSync(logFile, '=== KIỂM TRA API CHO PARENT UI ===\n', 'utf8');
    log(`Thời gian: ${new Date().toLocaleString('vi-VN')}\n`);

    try {
        // 1. LOGIN
        log('📝 BƯỚC 1: ĐĂNG NHẬP');
        const loginRes = await axios.post(`${API_URL}/auth/signin`, adminCreds);
        const token = loginRes.data.accessToken;
        
        if (!token) {
            log('❌ Login thất bại - Không có token');
            process.exit(1);
        }
        log('✅ Đăng nhập thành công!\n');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. TEST CÁC API QUAN TRỌNG CHO PARENT
        const endpoints = [
            { url: '/students', desc: 'DANH SÁCH HỌC SINH', critical: true },
            { url: '/routes', desc: 'DANH SÁCH LỘ TRÌNH', critical: true },
            { url: '/trips', desc: 'DANH SÁCH CHUYẾN ĐI', critical: true },
            { url: '/stations', desc: 'DANH SÁCH TRẠM DỪNG', critical: true },
            { url: '/buses', desc: 'DANH SÁCH XE BUS', critical: false },
            { url: '/schedules', desc: 'LỊCH TRÌNH', critical: false },
            { url: '/notifications', desc: 'THÔNG BÁO', critical: false },
            { url: '/users', desc: 'NGƯỜI DÙNG', critical: false },
        ];

        log('📊 BƯỚC 2: KIỂM TRA DỮ LIỆU\n');

        const results = {
            hasData: [],
            empty: [],
            error: []
        };

        for (const endpoint of endpoints) {
            try {
                const res = await axios.get(`${API_URL}${endpoint.url}`, { headers });
                
                let dataCount = 0;
                let dataPreview = '';
                
                if (Array.isArray(res.data)) {
                    dataCount = res.data.length;
                    dataPreview = dataCount > 0 ? JSON.stringify(res.data[0]).substring(0, 100) : '';
                } else if (res.data?.data && Array.isArray(res.data.data)) {
                    dataCount = res.data.data.length;
                    dataPreview = dataCount > 0 ? JSON.stringify(res.data.data[0]).substring(0, 100) : '';
                }

                const criticalTag = endpoint.critical ? '[QUAN TRỌNG]' : '[Phụ]';
                
                if (dataCount > 0) {
                    log(`✅ ${criticalTag} ${endpoint.desc}`);
                    log(`   URL: ${endpoint.url}`);
                    log(`   Số lượng: ${dataCount} item(s)`);
                    log(`   Preview: ${dataPreview}...`);
                    results.hasData.push(endpoint);
                } else {
                    log(`⚠️  ${criticalTag} ${endpoint.desc}`);
                    log(`   URL: ${endpoint.url}`);
                    log(`   Trạng thái: Trống (0 items)`);
                    results.empty.push(endpoint);
                }
                log('');

            } catch (err) {
                const criticalTag = endpoint.critical ? '[QUAN TRỌNG]' : '[Phụ]';
                log(`❌ ${criticalTag} ${endpoint.desc}`);
                log(`   URL: ${endpoint.url}`);
                log(`   Lỗi: [${err.response?.status}] ${err.response?.statusText || err.message}`);
                log('');
                results.error.push(endpoint);
            }
        }

        // 3. TÓM TẮT
        log('\n' + '='.repeat(60));
        log('📋 TÓM TẮT KẾT QUẢ');
        log('='.repeat(60));
        log(`✅ Có dữ liệu: ${results.hasData.length}/${endpoints.length}`);
        log(`⚠️  Trống: ${results.empty.length}/${endpoints.length}`);
        log(`❌ Lỗi: ${results.error.length}/${endpoints.length}\n`);

        // Check critical endpoints
        const criticalEndpoints = endpoints.filter(e => e.critical);
        const criticalWithData = results.hasData.filter(e => e.critical);
        
        log('🎯 ĐÁNH GIÁ CHO PARENT UI:');
        if (criticalWithData.length === criticalEndpoints.length) {
            log('✅ TỐT: Tất cả API quan trọng đều có dữ liệu!');
            log('   → Parent UI sẽ hoạt động bình thường.');
        } else {
            log('⚠️  CẢNH BÁO: Một số API quan trọng thiếu dữ liệu!');
            log('   → Parent UI có thể hiển thị trống.');
            log('\n   API THIẾU:');
            criticalEndpoints.forEach(ep => {
                if (!criticalWithData.includes(ep)) {
                    log(`   - ${ep.desc} (${ep.url})`);
                }
            });
        }

        log('\n✅ Kiểm tra hoàn tất! Xem chi tiết tại: parent_api_test.txt');

    } catch (error) {
        log(`\n❌ LỖI NGHIÊM TRỌNG: ${error.message}`);
        process.exit(1);
    }
}

testParentAPIs();
