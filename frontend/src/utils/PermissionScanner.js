// ============================================
// 🔍 PERMISSION SCANNER - Live API Audit Tool
// Kiểm tra chính xác API nào Parent có thể dùng
// ============================================

const API_BASE = 'https://smart-school-bus-api.onrender.com/api/v1';

const TEST_CREDENTIALS = {
  email: 'nguyenvanan@gmail.com',
  password: 'Parent@123'
};

// Danh sách API cần kiểm tra
const ENDPOINTS_TO_TEST = [
  // User endpoints
  { method: 'GET', path: '/users/me', category: 'User' },
  { method: 'GET', path: '/users', category: 'User' },
  
  // Students endpoints - thử mọi biến thể
  { method: 'GET', path: '/students', category: 'Students' },
  { method: 'GET', path: '/students/my-students', category: 'Students' },
  { method: 'GET', path: '/parents/students', category: 'Students' },
  { method: 'GET', path: '/parents/me/students', category: 'Students' },
  
  // Trips endpoints
  { method: 'GET', path: '/trips', category: 'Trips' },
  { method: 'GET', path: '/trips/my-schedule', category: 'Trips' },
  { method: 'GET', path: '/trips/upcoming', category: 'Trips' },
  
  // Notifications
  { method: 'GET', path: '/notifications', category: 'Notifications' },
  { method: 'GET', path: '/notifications/me', category: 'Notifications' },
  
  // Routes & Buses
  { method: 'GET', path: '/routes', category: 'Routes' },
  { method: 'GET', path: '/buses', category: 'Buses' },
  
  // Stations
  { method: 'GET', path: '/stations', category: 'Stations' },
];

async function runPermissionScan() {
  console.log('🚀 ============================================');
  console.log('🔍 STARTING PERMISSION SCAN FOR PARENT ACCOUNT');
  console.log('============================================');
  console.log('📧 Account:', TEST_CREDENTIALS.email);
  console.log('');

  let token = null;
  const results = {
    accessible: [],    // ✅ Status 200 & có data
    forbidden: [],     // ⛔ Status 403/401/500
    empty: [],         // ⚠️ Status 200 nhưng []
    notFound: []       // 404
  };

  // STEP 1: Login
  try {
    console.log('🔐 Step 1: Logging in...');
    const loginRes = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginRes.status);
      return;
    }

    const loginData = await loginRes.json();
    token = loginData.token;
    console.log('✅ Login successful! Token obtained.');
    console.log('👤 User:', loginData.user?.name, '-', loginData.user?.role);
    console.log('');
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return;
  }

  // STEP 2: Scan all endpoints
  console.log('🔍 Step 2: Scanning endpoints...');
  console.log('');

  for (const endpoint of ENDPOINTS_TO_TEST) {
    try {
      const url = `${API_BASE}${endpoint.path}`;
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const status = response.status;
      let data = null;
      
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // Phân loại kết quả
      if (status === 200) {
        const dataArray = data?.data || data;
        const hasData = Array.isArray(dataArray) ? dataArray.length > 0 : !!dataArray;
        
        if (hasData) {
          results.accessible.push({
            ...endpoint,
            status,
            dataCount: Array.isArray(dataArray) ? dataArray.length : 'object',
            sample: Array.isArray(dataArray) ? dataArray[0] : dataArray
          });
          console.log(`✅ ${endpoint.method} ${endpoint.path} - ${status} - ${Array.isArray(dataArray) ? dataArray.length + ' items' : 'Has data'}`);
        } else {
          results.empty.push({ ...endpoint, status });
          console.log(`⚠️  ${endpoint.method} ${endpoint.path} - ${status} - Empty`);
        }
      } else if (status === 403 || status === 401) {
        results.forbidden.push({ ...endpoint, status, message: data?.message });
        console.log(`⛔ ${endpoint.method} ${endpoint.path} - ${status} - Forbidden`);
      } else if (status === 404) {
        results.notFound.push({ ...endpoint, status });
        console.log(`❓ ${endpoint.method} ${endpoint.path} - ${status} - Not Found`);
      } else {
        results.forbidden.push({ ...endpoint, status, message: data?.message });
        console.log(`❌ ${endpoint.method} ${endpoint.path} - ${status} - ${data?.message || 'Error'}`);
      }

    } catch (error) {
      results.forbidden.push({ ...endpoint, status: 'ERROR', message: error.message });
      console.log(`💥 ${endpoint.method} ${endpoint.path} - ERROR - ${error.message}`);
    }
  }

  // STEP 3: Generate Report
  console.log('');
  console.log('============================================');
  console.log('📊 SCAN REPORT');
  console.log('============================================');
  console.log('');

  console.log('✅ GROUP 1: ACCESSIBLE APIs (Use in production)');
  console.log('────────────────────────────────────────────');
  if (results.accessible.length > 0) {
    results.accessible.forEach(item => {
      console.log(`  ${item.path} - ${item.dataCount} items`);
    });
  } else {
    console.log('  (None)');
  }
  console.log('');

  console.log('⚠️  GROUP 2: EMPTY APIs (Need fallback data)');
  console.log('────────────────────────────────────────────');
  if (results.empty.length > 0) {
    results.empty.forEach(item => {
      console.log(`  ${item.path}`);
    });
  } else {
    console.log('  (None)');
  }
  console.log('');

  console.log('⛔ GROUP 3: FORBIDDEN/ERROR APIs (DO NOT USE)');
  console.log('────────────────────────────────────────────');
  if (results.forbidden.length > 0) {
    results.forbidden.forEach(item => {
      console.log(`  ${item.path} - ${item.status} ${item.message ? '(' + item.message + ')' : ''}`);
    });
  } else {
    console.log('  (None)');
  }
  console.log('');

  console.log('❓ GROUP 4: NOT FOUND (Endpoint does not exist)');
  console.log('────────────────────────────────────────────');
  if (results.notFound.length > 0) {
    results.notFound.forEach(item => {
      console.log(`  ${item.path}`);
    });
  } else {
    console.log('  (None)');
  }
  console.log('');

  // STEP 4: Analysis
  console.log('============================================');
  console.log('🔍 ANALYSIS & RECOMMENDATIONS');
  console.log('============================================');
  console.log('');

  console.log('📋 Summary:');
  console.log(`  ✅ Working: ${results.accessible.length}`);
  console.log(`  ⚠️  Empty: ${results.empty.length}`);
  console.log(`  ⛔ Blocked: ${results.forbidden.length}`);
  console.log(`  ❓ Not Found: ${results.notFound.length}`);
  console.log('');

  console.log('🎯 Recommendations for Frontend:');
  console.log('  1. Use ONLY accessible APIs for real data');
  console.log('  2. Implement fallback mock data for empty APIs');
  console.log('  3. Never call forbidden APIs - will cause errors');
  console.log('  4. Check with Backend team for missing endpoints');
  console.log('');

  console.log('✅ Scan Complete!');
  console.log('============================================');

  return results;
}

export default runPermissionScan;
