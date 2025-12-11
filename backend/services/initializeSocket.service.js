const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const Bus = require('../models/bus.model');
const Location = require('../models/location.model');
const Station = require('../models/station.model');
const Trip = require('../models/trip.model');
const Student = require('../models/student.model');
const { Haversine } = require('../utils/haversine');
const Message = require('../models/message.model');
const cron = require('node-cron');
const getScheduleTimeToday = require('../utils/getScheduleTimeToday');
const Alert = require('../models/alert.model');
const turf = require('@turf/turf');

/**
 * Initializes Socket.IO event listeners and middleware.
 * @param {import('socket.io').Server} io The Socket.IO server instance.
 */
module.exports = (io) => {
    // Middleware truoc khi khoi tao ket noi
    io.use(async (socket, next) => {
        const apiKey = socket.handshake.auth?.apiKey;

        // Accept token from multiple handshake locations because WebSocket transport
        // does not always forward headers (e.g., mobile, certain proxies).
        const authHeader = socket.handshake.headers?.authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
        const tokenFromAuth = socket.handshake.auth?.token;
        const queryTokenRaw = socket.handshake.query?.token;
        const tokenFromQuery = Array.isArray(queryTokenRaw) ? queryTokenRaw[0] : queryTokenRaw;

        const token = tokenFromAuth || tokenFromQuery || tokenFromHeader;

        try {
            if (token) {
                let decode;
                try {
                    decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                    const user = await User.findById(decode.id).select('+isActive');
                    
                    if (!user) {
                        console.error(`❌ Socket Auth Failed: User ${decode.id} not found in DB`);
                        return next(new AppError('Authentication error: User not found or inactive.', 401));
                    }
                    
                    if (!user.isActive) {
                        console.error(`❌ Socket Auth Failed: User ${user.id} is inactive (role: ${user.role})`);
                        return next(new AppError('Authentication error: User not found or inactive.', 401));
                    }

                    socket.user = user;
                    console.log(`✅ Socket Auth Success: ${user.role} ${user.id} connected`);
                    return next();

                } catch (error) {
                    console.error('❌ Socket Auth Failed: Invalid token -', error.message);
                    return next(new AppError('Authentication error: Invalid token.', 401));
                }
            }
            else if (apiKey) {
                const bus = await Bus.findOne({ apiKey: apiKey });

                if (!bus)
                    return next(new AppError('Authentication error: Invalid API Key.', 401));

                socket.bus = bus;
                return next();
            }
            else {
                return next(new AppError('Authentication error: No credentials provided.', 401));
            }
        } catch (error) {
            return next(new AppError('Authentication error: Invalid credentials.', 401));
        }
    });

    // Nhận cảnh báo nếu xe bị trễ
    cron.schedule('*/5 * * * *', async () => {
        console.log('⏰ Cron: Bắt đầu kiểm tra trễ giờ...');

        const now = new Date();

        const LATENESS_BUFFET_MS = 5 * 60 * 1000;

        try {
            const inProgressTrips = await Trip.find({
                status: 'IN_PROGRESS',
                isLateAlertSent: { $ne: true }
            }).populate({
                path: 'scheduleId',
                select: 'stopTimes'
            }).populate({
                path: 'busId',
                select: 'licensePlate'
            });

            for (const trip of inProgressTrips) {
                // {
                // "_id": "...",
                // "stopTimes": [
                //     { "stationId": "...", "arrivalTime": "06:30" },
                //     { "stationId": "...", "arrivalTime": "07:00" }
                // ]
                // (Các trường khác bị ẩn vi select)
                // }  
                const schedule = trip.scheduleId;

                if (!schedule) continue;

                // Tìm Trạm Tiếp Theo (Next Station)
                const visitedStationIds = new Set(trip.actualStopTimes.map(s => s.stationId.toString()));

                // Không nằm trong những station đã tới
                // find() Chạy từ đầu đến cuối mảng. 
                // Ngay khi nó tìm thấy phần tử đầu tiên thỏa mãn điều kiện (chưa ghé),
                // nó sẽ dừng lại ngay lập tức và trả về phần tử đó.
                const nextStop = schedule.stopTimes.find(stop =>
                    !visitedStationIds.has(stop.stationId.toString()));

                if (!nextStop)
                    continue;

                const expectedTime = getScheduleTimeToday(nextStop.arrivalTime); // "07:00" -> Date

                // Ngưỡng báo động = Giờ dự kiến + 5 phút
                const alertThreshold = new Date(expectedTime.getTime() + LATENESS_BUFFET_MS);

                if (now > alertThreshold) {
                    const station = await Station.findById(nextStop.stationId).select('name');
                    const stationName = station ? station.name : 'Trạm không xác định';

                    console.warn(`⚠️ Trip ${trip._id} trễ giờ tới trạm ${nextStop.stationId}`);

                    await Alert.create({
                        busId: trip.busId,
                        driverId: trip.driverId,
                        message: `Xe ${trip.busId.licensePlate} đang trễ hơn 5 phút so với lịch trình đến trạm ${stationName}.`,
                        type: 'LATE'
                    });

                    io.to('receive_notification')
                        // Phụ huynh có thể: Nhận cảnh báo nếu xe bị trễ
                        .to(`trip_${trip._id}`)
                        .emit('alert:new', {
                            type: 'LATE',
                            message: `Xe ${trip.busId.licensePlate} đang trễ hơn 5 phút so với lịch trình đến trạm ${stationName}.`,
                            tripId: trip._id,
                            busId: trip.busId
                        });

                    trip.isLateAlertSent = true;
                    await trip.save();
                }
            }
        } catch (error) {
            console.error("Lỗi Cron Job:", error);
        }
    });

    // Xy ly su kien chinh
    io.on('connect', async (socket) => {
        // Nguoi xem
        if (socket.user) {
            const user = socket.user;
            console.log(`Một NGƯỜI XEM đã kết nối: ${socket.id} (UserId: ${user.id})`); // Tieng viet cho de hieu

            socket.join(`user:${user.id}`);
            socket.join(`role:${user.role}`);

            if (user.role === 'Admin' || user.role === 'Manager') {
                socket.join(`receive_notification`);
                // Khong join o day de tranh tinh trang xem dong thoi 300 xe :)))
                // socket.join('live-map');
            }

            // để đăng ký nhận thông báo cho chuyến đi đó.
            socket.on('join_trip_room', async (tripId) => {

                try {
                    let isAllowed = false;
                    let tripExists = false;

                    if (user.role === 'Admin' || user.role === 'Manager') {
                        const trip = await Trip.findById(tripId).select('_id');

                        if (trip) {
                            isAllowed = true;
                            tripExists = true;
                        }
                    }
                    else if (user.role === 'Driver'){

                        const trip = await Trip.findOne({
                            _id: tripId,
                            driverId: user.id
                        }).select('_id');

                        if (trip){
                            isAllowed = true;
                            tripExists = true;
                        }
                    }
                    else if (user.role === 'Parent') {
                        // Xu ly tac vu check xem co con minh trong chuyen do khong

                        const userStudents = await Student.find({ parentId: user._id }).select('_id');

                        if (userStudents.length > 0) {
                            const studentIds = userStudents.map(s => s._id);

                            const trip = await Trip.findOne(
                                {
                                    _id: tripId,
                                    'studentStops.studentId': { $in: studentIds }
                                }
                            ).select('_id');

                            if (trip) {
                                isAllowed = true;
                                tripExists = true;
                            }
                        }
                    }

                    if (isAllowed) {
                        socket.rooms.forEach(room => {
                            if (room.startsWith('trip_'))
                                socket.leave(room);
                        });
                        socket.join(`trip_${tripId}`);
                        console.log(`Một NGƯỜI XEM đã vào phòng với tripId: ${tripId} (UserId: ${user.id})`);
                    }

                    else {
                        if (!tripExists) {
                            console.log(`User ${user.id} BỊ TỪ CHỐI (Trip không tồn tại): ${tripId}`);
                        } else {
                            console.log(`User ${user.id} BỊ TỪ CHỐI (Không có quyền): ${tripId}`);
                        }
                        return;
                    }

                } catch (error) {
                    console.error(`Lỗi khi ${socket.user.id} join phòng trip_${tripId}:`, error);
                }

            });

            // Multi-tracking
            // socket.on('join_all_active_trips', async () => {
            //     const user = socket.user;

            //     if (user.role !== 'Parent') return;

            //     const userStudents = await Student.find({ parentId: user._id }).select('_id');

            //     if (userStudents.length === 0)
            //         return socket.emit('error', 'Bạn chưa liên kết với học sinh nào.');

            //     const activeTrips = await Trip.find({
            //         status: 'IN_PROGRESS',
                    
            //     });
            // });

            // leave room
            socket.on('leave_trip_room', (tripId) => {
                const roomName = `trip_${tripId}`;

                if (socket.rooms.has(roomName)) {
                    socket.leave(roomName);
                    console.log(`User ${socket.user.id} đã rời khỏi phòng ${roomName}`);
                }
            });

            // Gửi tin nhắn cho tài xế hoặc phụ huynh
            socket.on('chat:send_message', async (data) => {
                // data = { receiverId: "...", content: "Con tôi hôm nay nghỉ nhé" }
                let parsedData = data;
                try {
                    // Xử lý trường hợp client gửi lên dạng chuỗi JSON hoặc object
                    if (typeof parsedData === 'string') {
                        parsedData = JSON.parse(parsedData);
                    }
                    const { content, receiverId } = parsedData;
                    const senderId = user.id;
                    const senderRole = user.role;

                    if (senderRole === 'Parent' || senderRole === 'Driver') {
                        const newMessage = await Message.create({
                            senderId: senderId,
                            receiverId: null,
                            content: content
                        });

                        io.to('receive_notification').emit('chat:receive_message', newMessage);
                    }
                    else if (senderRole === 'Admin' || senderRole === 'Manager') {
                        const newMessage = await Message.create({
                            senderId: senderId,
                            receiverId: receiverId,
                            content: content
                        });

                        io.to(`user:${receiverId}`).emit('chat:receive_message', newMessage);
                    }
                } catch (error) {
                    console.error("Lỗi gửi tin nhắn:", error);
                    socket.emit('chat:error', 'Không thể gửi tin nhắn');
                }
            });

            socket.on('driver:send_alert', async (data) => {
                // data = { type: 'SOS', message: 'Xe hỏng lốp!' }
                try {
                    const driverId = socket.user.id;

                    // Tìm chuyến đi đang chạy của tài xế này (Source of Truth)
                    // (Vì tài xế chỉ có thể lái 1 xe tại 1 thời điểm)
                    const activeTrip = await Trip.findOne({
                        driverId: driverId,
                        status: 'IN_PROGRESS'
                    });

                    if (!activeTrip) {
                        return socket.emit('alert:error', 'Bạn chưa bắt đầu chuyến đi nào.');
                    }

                    const newAlert = await Alert.create({
                        busId: activeTrip.busId,
                        driverId: driverId,
                        type: data.type || 'SOS',
                        message: data.message,
                        timestamp: new Date()
                    });

                    io.to('receive_notification')
                        .to(`trip_${activeTrip._id}`)
                        .emit('alert:new', newAlert);

                    // Phản hồi cho tài xế yên tâm :))
                    socket.emit('alert:success', 'Đã gửi cảnh báo!');

                } catch (error) {
                    console.error("Lỗi SOS:", error);
                }
            });

            // DRIVER APP: BẮT ĐẦU/KẾT THÚC CHUYẾN
            // Cho phép User role Driver emit start/end trip từ app
            // Server sẽ forward event đến Bus socket (simulation) tương ứng

            socket.on('driver:start_trip', async (data) => {
                if (user.role !== 'Driver') {
                    return socket.emit('trip:error', 'Chỉ tài xế mới có thể bắt đầu chuyến.');
                }

                try {
                    const tripId = data.tripId;
                    const driverId = user.id;

                    const trip = await Trip.findById(tripId).populate({
                        path: 'routeId',
                        populate: { path: 'orderedStops' }
                    });

                    if (!trip)
                        return socket.emit('trip:error', 'Trip ID không tồn tại.');

                    if (trip.driverId.toString() !== driverId.toString())
                        return socket.emit('trip:error', 'Bạn không được gán cho chuyến này.');

                    // Không update DB ở đây vì Bus socket sẽ update khi emit driver:start_trip

                    console.log(`🚀 Driver ${driverId} đã BẮT ĐẦU chuyến ${tripId} từ app`);
                    // Không emit ở đây vì Bus socket sẽ emit sau khi nhận server:start_trip
                    // socket.emit('trip:started_successfully');
                    // io.to(`trip_${tripId}`).emit('trip:started');

                    // Forward đến tất cả Bus socket có cùng busId (simulation)
                    const busId = trip.busId.toString();
                    for (const [socketId, s] of io.sockets.sockets) {
                        if (s.bus && s.bus.id === busId) {
                            console.log(`📡 Forward start_trip đến Bus socket ${socketId}`);
                            s.emit('server:start_trip', { 
                                tripId: tripId,
                                routeStops: trip.routeId.orderedStops.map(stop => ({
                                    id: stop._id.toString(),
                                    name: stop.name,
                                    lat: stop.address.location.coordinates[1],
                                    lng: stop.address.location.coordinates[0]
                                })),
                                routeShape: trip.routeId.shape
                            });
                        }
                    }

                } catch (error) {
                    console.error(`Lỗi khi Driver ${user.id} bắt đầu chuyến:`, error.message);
                    socket.emit('trip:error', 'Lỗi server khi bắt đầu chuyến đi.');
                }
            });

            socket.on('driver:end_trip', async () => {
                if (user.role !== 'Driver') {
                    return socket.emit('trip:error', 'Chỉ tài xế mới có thể kết thúc chuyến.');
                }

                try {
                    const driverId = user.id;

                    // Tìm chuyến đang chạy của driver này (populate route để lấy số trạm)
                    const activeTrip = await Trip.findOne({
                        driverId: driverId,
                        status: 'IN_PROGRESS'
                    }).populate({
                        path: 'routeId',
                        select: 'orderedStops'
                    });

                    if (!activeTrip) {
                        return socket.emit('trip:error', 'Không có chuyến đi nào đang chạy.');
                    }

                    // VALIDATION: Kiểm tra đã đến trạm cuối chưa
                    const totalStations = activeTrip.routeId?.orderedStops?.length || 0;
                    const currentIndex = activeTrip.nextStationIndex || 0;
                    
                    if (currentIndex < totalStations) {
                        return socket.emit('trip:error', `Không thể kết thúc chuyến đi khi chưa tới trạm cuối (${currentIndex}/${totalStations}).`);
                    }

                    const tripId = activeTrip._id.toString();

                    // Không update DB ở đây vì Bus socket sẽ update khi emit driver:end_trip

                    console.log(`🏁 Driver ${driverId} đã KẾT THÚC chuyến ${tripId} từ app`);
                    // Không emit ở đây vì Bus socket sẽ emit sau khi nhận server:end_trip
                    // socket.emit('trip:ended_successfully');
                    // io.to(`trip_${tripId}`).emit('trip:completed');

                    // Forward đến Bus socket (simulation)
                    const busId = activeTrip.busId.toString();
                    for (const [socketId, s] of io.sockets.sockets) {
                        if (s.bus && s.bus.id === busId) {
                            console.log(`📡 Forward end_trip đến Bus socket ${socketId}`);
                            s.emit('server:end_trip');
                        }
                    }

                } catch (error) {
                    console.error(`Lỗi khi Driver ${user.id} kết thúc chuyến:`, error.message);
                    socket.emit('trip:error', 'Lỗi server khi kết thúc chuyến đi.');
                }
            });
            // ================== END DRIVER APP ==================

            socket.on('disconnect', () => {
                console.log(`Một NGƯỜI XEM đã ngắt kết nối: ${socket.id} (UserId: ${user.id})`); // Tieng viet cho de hieu
            });
        }
        // Nguoi gui
        else if (socket.bus) {
            const bus = socket.bus;
            console.log(`Một XE BUÝT đã kết nối: ${socket.id} (BusId: ${bus.id})`); // Tieng viet cho de hieu
            // Client (điện thoại của bạn bè): Lấy vị trí GPS (navigator.geolocation).

            // Gửi lên Server: emit tọa độ lên server (gps-ping).

            // Server (backend): Nhận tọa độ đó và emit xuống cho (người đang xem bản đồ).

            // Xe buýt phải emit sự kiện này 1 LẦN KHI BẮT ĐẦU CHUYẾN
            socket.on('driver:start_trip', async (data) => {
                try {
                    const tripId = data.tripId;
                    const busId = socket.bus.id;

                    const trip = await Trip.findById(tripId).populate({
                        path: 'routeId',
                        populate: { path: 'orderedStops' } // Lấy coords các trạm
                    });

                    if (!trip)
                        return socket.emit('trip:error', 'Trip ID không tồn tại.');

                    if (trip.busId.toString() !== busId.toString())
                        return socket.emit('trip:error', 'Xe buýt không được gán cho chuyến này.');

                    if (trip.status !== 'NOT_STARTED') {
                        // Có thể không phải lỗi, chỉ cần báo là đã chạy rồi
                        console.log(`Xe buýt ${busId} đã RESUME chuyến ${trip._id.toString()}`);
                    } else {
                        // Tac vu bat buoc => MUST AWAIT (tranh race condition)
                        trip.status = 'IN_PROGRESS';
                        trip.actualStartTime = new Date();
                        await trip.save();
                    }

                    // Cache data vào Socket để dùng sau lày hẹ hẹ (Lưu vào RAM)
                    socket.tripId = trip._id.toString();

                    socket.driverId = trip.driverId;

                    socket.routeName = trip.routeId.name;

                    socket.routeShape = trip.routeId.shape;

                    socket.isOffRoute = false;

                    socket.routeStops = trip.routeId.orderedStops.map(stop => ({
                        id: stop._id.toString(),
                        name: stop.name,
                        lat: stop.address.location.coordinates[1],
                        lng: stop.address.location.coordinates[0]
                    }));

                    // Sync trạng thái hiện tại từ DB vào Socket
                    socket.trackingState = {
                        nextStationIndex: trip.nextStationIndex || 0,
                        hasNotifiedApproaching: trip.hasNotifiedApproaching || false,
                        hasNotifiedArrived: trip.hasNotifiedArrived || false
                    };

                    console.log(`Xe buýt ${busId} đã BẮT ĐẦU chuyến ${socket.tripId}`);
                    socket.emit('trip:started_successfully');

                    io.to(`trip_${tripId}`).emit('trip:started');
                } catch (error) {
                    // Nếu .save() hoặc .findById() bị lỗi, nó sẽ nhảy vào đây
                    console.error(`Lỗi khi xe ${socket.bus.id} bắt đầu chuyến ${data.tripId}:`, error.message);
                    socket.emit('trip:error', 'Lỗi server, không thể bắt đầu chuyến đi.');
                }
            });

            const MIN_DISTANCE_THRESHOLD = 0.001; // km
            const DB_SAVE_INTERVAL_MS = 10000; // ms
            // Threshold cho tracking (km)
            // Dựa trên khoảng cách thực tế từ route đến trạm:
            // - Trạm 2: 66m, Trạm 4: 61m → cần ARRIVED >= 70m
            // Công thức: APPROACHING + DEPARTED < khoảng cách min giữa các trạm (150m)
            // → 80m + 80m = 160m > 150m ❌ nhưng phải chấp nhận vì route không đi sát trạm
            const DISTANCE_APPROACHING = 0.1;  // 100m: sắp tới
            const DISTANCE_ARRIVED = 0.08;     // 80m: đã tới (phải >= 66m của Trạm 2)
            const DISTANCE_DEPARTED = 0.1;     // 100m: đã rời đi
            const ROUTE_DEVIATION_THRESHOLD = 50; // m

            // QUAN TRỌNG: Không cho join bất kỳ phòng nào cả
            socket.on('driver:update_location', async (data) => {
                // data format: {busId: '', coords: {latitude: '',longitude: ''}}

                // Chỉ tin vào 'bus' đax được xác thực sau Middleware tren
                const busId = socket.bus.id;
                const validatedTripId = socket.tripId;
                const newCoords = data.coords;
                const currentTime = Date.now();

                if (!newCoords || (typeof newCoords !== 'object')) {
                    console.warn(`Invalid coords payload from bus ${busId}: missing coords`);
                    return;
                }

                if (!validatedTripId || !socket.routeStops)
                    return; // Bỏ qua nếu xe chưa bắt đầu chuyến (start_trip)

                if (!socket.lastDbUpdatedTime)
                    socket.lastDbUpdatedTime = currentTime;

                if (!socket.prevCoords) {
                    io.to(`trip_${validatedTripId}`).emit('bus:location_changed', {
                        coords: newCoords,
                        nextStationIndex: socket.trackingState.nextStationIndex,
                        totalStations: socket.routeStops.length
                    });

                    Bus.updateCurrentStatus(busId, newCoords)
                        .catch(err => console.error(`Lỗi cập nhật status bus ${busId}:`, err));

                    socket.lastDbUpdatedTime = currentTime;
                    socket.prevCoords = newCoords;
                    return;
                }


                // Chỉ xử lý và gửi đi khi tọa độ thực sự thay đổi
                if (Haversine.distance(socket.prevCoords, newCoords) > MIN_DISTANCE_THRESHOLD) {

                    if (socket.routeShape && socket.routeShape.coordinates) {

                        // Kiểm tra xe có đang lệch tuyến không thông qua Turf pointToLineDistance
                        const busPoint = turf.point([newCoords.longitude, newCoords.latitude]);
                        const routeLine = turf.lineString(socket.routeShape.coordinates);
                        const deviationDist = turf.pointToLineDistance(busPoint, routeLine, { units: "meters" });
                        if (deviationDist > ROUTE_DEVIATION_THRESHOLD) {
                            if (!socket.isOffRoute) {
                                console.warn(`⚠️ Xe ${busId} bắt đầu chệch tuyến (${deviationDist.toFixed(0)}m)`);
                                const alertData = {
                                    busId: busId,
                                    driverId: socket.driverId,
                                    message: `Cảnh báo: Xe đã đi chệch tuyến đường ${deviationDist.toFixed(0)}m!`,
                                    type: 'OFF_ROUTE'
                                };

                                Alert.create(alertData).catch(console.error);

                                io.to('receive_notification').to(`trip_${validatedTripId}`).emit('alert:new', alertData);
                                socket.isOffRoute = true;
                            }
                        }
                        else {
                            if (socket.isOffRoute) {
                                console.log(`✅ Xe ${busId} đã quay lại đúng tuyến.`);
                                socket.isOffRoute = false;
                            }
                        }
                    }

                    // Uu tien 1
                    // Gui cho nhung ai dang trong phong live-map VA dang coi map
                    // Mục đích Volatile:
                    // Xe buýt gửi tọa độ A.
                    // Phụ huynh mất mạng.
                    // Xe buýt gửi B, C, D (với cờ volatile).
                    // Server thấy phụ huynh đang offline -> VỨT LUÔN B, C, D. Không lưu trữ gì cả.
                    io.to(`trip_${validatedTripId}`).volatile.emit('bus:location_changed', {
                        coords: newCoords,
                        nextStationIndex: socket.trackingState.nextStationIndex,
                        totalStations: socket.routeStops.length
                    });

                    // Uu tien 2 => KHONG DUNG await de tranh tac nghen
                    if ((currentTime - socket.lastDbUpdatedTime) > DB_SAVE_INTERVAL_MS) {
                        Bus.updateCurrentStatus(busId, newCoords)
                            .catch(err => console.error(`Lỗi cập nhật status bus ${busId}:`, err));

                        socket.lastDbUpdatedTime = currentTime;
                    }

                    // Chi nen su dung khi can data len bao cao
                    // await Location.saveHistory(busId, data.coords);
                    socket.prevCoords = newCoords;
                }

                // 🔥 LOGIC TÍNH TOÁN SẮP TỚI, TỚI, RỜI TRẠM
                const state = socket.trackingState;
                const stops = socket.routeStops;

                // đi hết trạm skippp
                if (state.nextStationIndex >= stops.length) return;

                const targetStation = stops[state.nextStationIndex];

                const distance = Haversine.distance(
                    { latitude: newCoords.latitude, longitude: newCoords.longitude },
                    { latitude: targetStation.lat, longitude: targetStation.lng }
                );

                if (distance <= DISTANCE_APPROACHING && !state.hasNotifiedApproaching) {
                    io.to(`trip_${validatedTripId}`).emit('bus:approaching_station', {
                        stationId: targetStation.id,
                        message: "Xe buýt sắp đến trạm!"
                    });

                    state.hasNotifiedApproaching = true;
                    await Trip.updateOne({ _id: validatedTripId }, { hasNotifiedApproaching: true })
                        .catch((error) => {
                            console.error(`Lỗi DB SẮP TỚI trạm ${targetStation.id}:`, error);
                            socket.emit('trip:error', 'Lỗi server khi ghi nhận sắp tới trạm.');
                        });
                }

                if (distance <= DISTANCE_ARRIVED && !state.hasNotifiedArrived) {
                    io.to(`trip_${validatedTripId}`).emit('bus:arrived_at_station', {
                        stationId: targetStation.id,
                        arrivalTime: new Date()
                    });

                    state.hasNotifiedArrived = true;

                    await Trip.updateOne(
                        {
                            _id: validatedTripId,

                            // BUG SIÊU KHỦNG KHIẾP (không ghi nhận những trạm không có học sinh)
                            // 'studentStops.stationId': targetStation.id,

                            'actualStopTimes.stationId': { $ne: targetStation.id }
                        },
                        {
                            $push: {
                                actualStopTimes: {
                                    stationId: targetStation.id,
                                    arrivalTime: new Date()
                                }
                            },
                            $set: {
                                hasNotifiedArrived: true
                            }
                        }
                    ).catch((error) => {
                        console.error(`Lỗi DB TỚI trạm ${targetStation.id}:`, error);
                        socket.emit('trip:error', 'Lỗi server khi ghi nhận tới trạm.');
                    });
                }

                if (distance >= DISTANCE_DEPARTED && state.hasNotifiedArrived) {
                    io.to(`trip_${validatedTripId}`).emit('bus:departed_from_station', {
                        stationId: targetStation.id,
                        departureTime: new Date()
                    });

                    state.nextStationIndex++;
                    state.hasNotifiedApproaching = false;
                    state.hasNotifiedArrived = false;

                    // Emit ngay khi nextStationIndex thay đổi
                    // để client cập nhật kịp luck (không phải chờ coords thay đổi)
                    io.to(`trip_${validatedTripId}`).emit('bus:location_changed', {
                        coords: newCoords,
                        nextStationIndex: state.nextStationIndex,
                        totalStations: stops.length
                    });

                    await Trip.updateOne(
                        {
                            _id: validatedTripId,
                            'actualStopTimes.stationId': targetStation.id
                        },
                        {
                            $set: {
                                'actualStopTimes.$.departureTime': new Date(),
                                nextStationIndex: state.nextStationIndex,
                                hasNotifiedApproaching: state.hasNotifiedApproaching,
                                hasNotifiedArrived: state.hasNotifiedArrived
                            }
                        }
                    )
                        .catch((error) => {
                            console.error(`Lỗi DB RỜI trạm ${targetStation.id}:`, error);
                            socket.emit('trip:error', 'Lỗi server khi ghi nhận rời trạm.');
                        });

                    // Auto absent voi nhung hoc sinh chua len xe
                    // Để cập nhật TẤT CẢ các học sinh thỏa mãn điều kiện, bắt buộc phải dùng arrayFilters.
                    Trip.updateOne(
                        {
                            _id: validatedTripId
                        },
                        {
                            $set: {
                                'studentStops.$[elem].action': 'ABSENT'
                            }
                        },
                        {
                            // fix lỗi tự động báo vắng vì quên 2 ngoặc []
                            arrayFilters: [{
                                'elem.stationId': targetStation.id,
                                'elem.action': 'PENDING'
                            }]
                        }
                    )
                        .then(updateResult => {
                            if (updateResult.modifiedCount > 0) {

                                // Khong xai socket.to('room').emit() vi tai xe hoac xe buyt dang khong trong 'room' do.
                                // io la toan server quan ly tat ca nen thong bao duoc
                                // Note: Chua giai quyet duoc viec bao vang specific (cu the).
                                console.log(`Đã tự động báo vắng ${updateResult.modifiedCount} học sinh tại trạm ${targetStation.id}`);
                                io.to(`trip_${validatedTripId}`).emit('trip:students_marked_absent',
                                    {
                                        stationId: targetStation.id,
                                        count: updateResult.modifiedCount
                                    });
                            }
                        })
                        .catch(err => {
                            console.error(`Lỗi tự động báo vắng cho chuyến ${validatedTripId}:`, err);
                        });
                }
            });

            // ❌ XÓA: driver:approaching_station  ---\
            // ❌ XÓA: driver:arrived_at_station   ------> put in event driver:update_location
            // ❌ XÓA: driver:departed_from_station---/

            // Ket thuc chuyen
            // Tài xế bấm nút KẾT THÚC
            socket.on('driver:end_trip', async () => {
                try {
                    const validatedTripId = socket.tripId;
                    const busId = socket.bus.id;

                    if (!validatedTripId) {
                        return socket.emit('trip:error', 'Không thể kết thúc chuyến đi chưa bắt đầu.');
                    }

                    if (socket.trackingState.nextStationIndex !== socket.routeStops.length)
                        return socket.emit('trip:error', 'Không thể kết thúc chuyến đi khi chưa tới trạm cuối');

                    // 1. Cập nhật CSDL
                    // Dùng await vì đây là tác vụ quan trọng
                    const updateResult = await Trip.updateOne(
                        { _id: validatedTripId, status: 'IN_PROGRESS' },
                        {
                            $set: {
                                status: 'COMPLETED',
                                // (Tùy chọn: Thêm trường này để biết giờ kết thúc)
                                actualEndTime: new Date()
                            }
                        }
                    );

                    if (updateResult.modifiedCount > 0) {
                        console.log(`Xe buýt ${busId} đã KẾT THÚC chuyến ${validatedTripId}`);

                        // 2. Thông báo cho Phụ huynh/Admin
                        io.to(`trip_${validatedTripId}`).emit('trip:completed');

                        // 3. Thông báo riêng cho Driver (để app biết và cho bấm nút hoàn thành)
                        io.to(`user:${socket.driverId}`).emit('trip:completed', {
                            tripId: validatedTripId,
                            message: 'Chuyến đi đã hoàn thành!'
                        });

                        // 4. Dọn dẹp
                        socket.tripId = null;
                    }

                } catch (error) {
                    console.error(`Lỗi khi xe ${socket.bus.id} kết thúc chuyến:`, error);
                    socket.emit('trip:error', 'Lỗi server khi kết thúc chuyến đi.');
                }
            });
            socket.on('disconnect', () => {
                console.log(`Một XE BUÝT đã ngắt kết nối: ${socket.id} (BusId: ${bus.id})`); // Tieng viet cho de hieu
            });
        }

    });
};