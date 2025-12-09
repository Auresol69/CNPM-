const io = require('socket.io-client');
const axios = require('axios');

// ================= CẤU HÌNH =================
const SERVER_URL = 'https://smart-school-bus-api.onrender.com';
const API_KEY = 'edcb1e0d-604b-4f95-b711-5e30daad380b';
const ACCESS_TOKEN = ''; // Thêm token của driver
const TRIP_ID = '69385ffc7479a797e8784a6f';
const UPDATE_INTERVAL = 1000;
const STOP_DURATION = 30;

// ============================================

let routePath = [];
let stopIndices = [];
let currentIndex = 0;
let isRunning = false;
let simulationInterval;
let isStopping = false;
let stopCounter = 0;

console.log('🤖 Smart Bot Driver đang khởi động...');

// Hàm tính khoảng cách Haversine đơn giản
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Hàm tìm index gần nhất với trạm
function findClosestIndex(stationLat, stationLng) {
    let minDist = Infinity;
    let closestIdx = 0;
    
    routePath.forEach((point, idx) => {
        const dist = calculateDistance(
            stationLat, stationLng,
            point[1], point[0] // [lng, lat] -> lat, lng
        );
        if (dist < minDist) {
            minDist = dist;
            closestIdx = idx;
        }
    });
    
    return closestIdx;
}

// Bước 1: Lấy thông tin Trip từ API
async function fetchTripData() {
    try {
        console.log('📡 Đang lấy thông tin Trip từ API...');
        
        const response = await axios.get(`${SERVER_URL}/api/v1/trips/${TRIP_ID}`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        const trip = response.data.data;
        
        // Lấy route path
        routePath = trip.routeId.shape.coordinates;
        console.log(`✅ Đã tải ${routePath.length} điểm trên route`);
        
        // Lấy danh sách trạm và tự động tìm index
        const stations = trip.routeId.orderedStops;
        console.log(`\n📍 Tìm index cho ${stations.length} trạm:\n`);
        
        stopIndices = stations.map((station, i) => {
            const stationLat = station.address.location.coordinates[1];
            const stationLng = station.address.location.coordinates[0];
            const idx = findClosestIndex(stationLat, stationLng);
            
            console.log(`   ${i + 1}. ${station.name}`);
            console.log(`      Tọa độ: [${stationLng.toFixed(6)}, ${stationLat.toFixed(6)}]`);
            console.log(`      Index: ${idx}\n`);
            
            return idx;
        });
        
        // Bỏ index 0 (điểm xuất phát) khỏi danh sách dừng
        stopIndices = stopIndices.filter(idx => idx > 0);
        
        console.log(`✅ STOP_INDICES: [${stopIndices.join(', ')}]\n`);
        
        return true;
    } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu Trip:', error.response?.data || error.message);
        return false;
    }
}

// Bước 2: Kết nối Socket và bắt đầu
const socket = io(SERVER_URL, { auth: { apiKey: API_KEY } });

socket.on('connect', async () => {
    console.log('✅ Đã kết nối Socket:', socket.id);
    
    // Lấy dữ liệu trước khi start trip
    const success = await fetchTripData();
    
    if (!success) {
        console.log('❌ Không thể lấy dữ liệu. Thoát.');
        process.exit(1);
    }
    
    console.log('🚀 Bắt đầu Trip...\n');
    socket.emit('driver:start_trip', { tripId: TRIP_ID });
});

socket.on('trip:started_successfully', () => {
    console.log('✅ Trip đã bắt đầu! Bắt đầu lái xe...\n');
    isRunning = true;
    drive();
});

socket.on('trip:completed', () => {
    console.log('\n🏁 SERVER XÁC NHẬN: TRIP COMPLETED!');
    process.exit(0);
});

socket.on('bus:approaching_station', (data) => {
    console.log(`\n📢 Sắp đến trạm: ${data.stationId}`);
});

socket.on('bus:arrived_at_station', (data) => {
    console.log(`\n✅ Đã đến trạm: ${data.stationId}`);
});

socket.on('bus:departed_from_station', (data) => {
    console.log(`\n🚌 Đã rời trạm: ${data.stationId}`);
});

function drive() {
    simulationInterval = setInterval(() => {
        if (!isRunning) return;

        // Safety check
        if (!routePath || routePath.length === 0) {
            console.error('\n❌ Route path chưa được load!');
            clearInterval(simulationInterval);
            return;
        }

        if (currentIndex >= routePath.length) {
            console.error('\n❌ Index vượt quá route path!');
            clearInterval(simulationInterval);
            return;
        }

        const rawPoint = routePath[currentIndex];
        if (!rawPoint || rawPoint.length < 2) {
            console.error(`\n❌ Điểm ${currentIndex} không hợp lệ:`, rawPoint);
            currentIndex++;
            return;
        }

        const coords = { latitude: rawPoint[1], longitude: rawPoint[0] };

        // 1. Gửi tọa độ
        socket.emit('driver:update_location', { coords: coords });

        // 2. Kiểm tra dừng trạm
        if (stopIndices.includes(currentIndex) && !isStopping) {
            console.log(`\n\n🚏 ĐÃ ĐẾN TRẠM (Index ${currentIndex}). Dừng ${STOP_DURATION}s...`);
            isStopping = true;
            stopCounter = 0;
        }

        // 3. Xử lý khi đang dừng
        if (isStopping) {
            stopCounter++;
            process.stdout.write(`\r⏳ Đang dừng: ${stopCounter}/${STOP_DURATION}s ... `);

            if (stopCounter >= STOP_DURATION) {
                console.log('\n▶️ Tiếp tục di chuyển!');
                isStopping = false;
                
                // Kiểm tra xem có phải trạm cuối không
                if (currentIndex >= routePath.length - 1) {
                    clearInterval(simulationInterval);
                    console.log('\n🛑 Đến bến cuối. Đợi 5s...');
                    
                    let count = 0;
                    const wait = setInterval(() => {
                        socket.emit('driver:update_location', { coords: coords });
                        count++;
                        if (count >= 5) {
                            clearInterval(wait);
                            console.log('\n🔘 Kết thúc Trip...');
                            socket.emit('driver:end_trip');
                        }
                    }, 1000);
                    return;
                }
                
                currentIndex++;
            }
            return; 
        }

        // 4. Di chuyển bình thường
        const progress = ((currentIndex / routePath.length) * 100).toFixed(1);
        process.stdout.write(`\r🚌 ${progress}% [${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}]`);

        if (currentIndex >= routePath.length - 1) {
            clearInterval(simulationInterval);
            console.log('\n🛑 Đến bến cuối. Đợi 5s...');
            
            let count = 0;
            const wait = setInterval(() => {
                socket.emit('driver:update_location', { coords: coords });
                count++;
                if (count >= 5) {
                    clearInterval(wait);
                    console.log('\n🔘 Kết thúc Trip...');
                    socket.emit('driver:end_trip');
                }
            }, 1000);

        } else {
            currentIndex++;
        }
    }, UPDATE_INTERVAL);
}
