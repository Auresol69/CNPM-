/**
 * Account Scanner - Quét tìm tài khoản có dữ liệu học sinh
 * Chạy một lần để tìm tài khoản VIP cho Demo
 */

const API_BASE_URL = 'https://smart-school-bus-api.onrender.com/api/v1';

const PARENT_ACCOUNTS = [
  // Test tài khoản này trước
  { username: 'nguyenvanan@gmail.com', password: 'Parent@123' },
  // Tài khoản test từ Backend team
  { username: 'parent_test_1764258455221@gmail.com', password: '123' },
  { username: 'tranthibinh@gmail.com', password: 'Parent@123' },
  { username: 'levancuong@gmail.com', password: 'Parent@123' },
  { username: 'phamthidung@gmail.com', password: 'Parent@123' },
  { username: 'hoangvanem@gmail.com', password: 'Parent@123' },
  { username: 'vuthiphuong@gmail.com', password: 'Parent@123' },
  { username: 'dangvangiang@gmail.com', password: 'Parent@123' },
  { username: 'buithihoa@gmail.com', password: 'Parent@123' },
  { username: 'ngovankhach@gmail.com', password: 'Parent@123' },
  { username: 'duongthilan@gmail.com', password: 'Parent@123' }
];

export async function scanAccounts() {
  console.log('🔍 BẮT ĐẦU QUÉT TÀI KHOẢN...');
  console.log('='.repeat(50));
  
  const results = {
    success: [],
    empty: [],
    error: []
  };

  for (const account of PARENT_ACCOUNTS) {
    try {
      console.log(`\n📧 Đang kiểm tra: ${account.username}`);
      
      // 1. Login - thử cả 2 format
      const loginRes = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: account.username, password: account.password })
      });

      if (!loginRes.ok) {
        console.log(`   ❌ Login thất bại: ${loginRes.status}`);
        results.error.push({ email: account.username, reason: 'Login failed' });
        continue;
      }

      const loginData = await loginRes.json();
      
      // 🔍 DEBUG: In ra toàn bộ response để xem cấu trúc
      console.log(`   📦 Response:`, JSON.stringify(loginData, null, 2));
      
      // Docs nói trả về "token" (không phải "accessToken")
      const token = loginData.token || 
                    loginData.accessToken || 
                    loginData.data?.token ||
                    loginData.data?.accessToken;
                    
      const userId = loginData.data?.user?._id || 
                     loginData.user?._id ||
                     loginData.data?._id;

      console.log(`   🔑 Token found: ${token ? 'YES' : 'NO'}`);
      console.log(`   👤 User ID: ${userId || 'NOT FOUND'}`);

      if (!token) {
        console.log(`   ❌ Không có token trong response`);
        results.error.push({ email: account.username, reason: 'No token in response' });
        continue;
      }

      // 2. Theo docs, Parent lấy students qua /trips/my-schedule
      const headers = { 'Authorization': `Bearer ${token}` };
      let students = [];
      let tripInfo = null;
      
      try {
        const tripsRes = await fetch(`${API_BASE_URL}/trips/my-schedule`, { headers });
        console.log(`   📡 /trips/my-schedule status: ${tripsRes.status}`);
        
        if (tripsRes.ok) {
          const tripsData = await tripsRes.json();
          const trips = tripsData.data || [];
          console.log(`   🚌 Số chuyến: ${trips.length}`);
          
          if (trips.length > 0) {
            tripInfo = trips[0];
            // Lấy chi tiết trip đầu tiên để xem students
            const tripDetailRes = await fetch(`${API_BASE_URL}/trips/${trips[0]._id}`, { headers });
            if (tripDetailRes.ok) {
              const tripDetail = await tripDetailRes.json();
              const trip = tripDetail.data || tripDetail;
              console.log(`   📦 Trip detail keys:`, Object.keys(trip));
              
              // Students từ studentStops
              if (trip.studentStops && trip.studentStops.length > 0) {
                students = trip.studentStops.map(ss => ({
                  id: ss.studentId,
                  status: ss.action
                }));
              }
            }
          }
        }
      } catch (e) {
        console.log(`   ⚠️ Trips API failed:`, e.message);
      }

      // 3. Check results
      if (students.length > 0) {
        const studentNames = students.map(s => s.name || 'Unknown').join(', ');
        console.log(`   ✅ TÌM THẤY: ${students.length} học sinh (${studentNames})`);
        results.success.push({ 
          email: account.username, 
          userId,
          studentCount: students.length, 
          students: students.map(s => ({ name: s.name, class: s.class || s.grade }))
        });
      } else {
        console.log(`   ❌ RỖNG: Không có học sinh`);
        results.empty.push({ email: account.username });
      }

      // Delay để tránh rate limit
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      console.log(`   ❌ LỖI: ${error.message}`);
      results.error.push({ email: account.username, reason: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 KẾT QUẢ TỔNG HỢP:');
  console.log('='.repeat(50));

  if (results.success.length > 0) {
    console.log('\n🏆 TÀI KHOẢN VIP (Có học sinh):');
    results.success.forEach(acc => {
      console.log(`   ✅ ${acc.email}`);
      console.log(`      - User ID: ${acc.userId}`);
      console.log(`      - Số học sinh: ${acc.studentCount}`);
      acc.students.forEach(s => {
        console.log(`      - ${s.name} (Lớp: ${s.class || 'N/A'})`);
      });
    });
  }

  if (results.empty.length > 0) {
    console.log('\n📭 TÀI KHOẢN RỖNG:');
    results.empty.forEach(acc => {
      console.log(`   ❌ ${acc.email}`);
    });
  }

  if (results.error.length > 0) {
    console.log('\n⚠️ TÀI KHOẢN LỖI:');
    results.error.forEach(acc => {
      console.log(`   ❌ ${acc.email} - ${acc.reason}`);
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ QUÉT HOÀN TẤT!');
  
  return results;
}

export default scanAccounts;
