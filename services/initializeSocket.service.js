const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const Bus = require('../models/bus.model');
const Location = require('../models/location.model');
const Trip = require('../models/trip.model');
const Student = require('../models/student.model');
const { Haversine } = require('../utils/haversine');
const Message = require('../models/message.model');
const cron = require('node-cron');
const getScheduleTimeToday = require('../utils/getScheduleTimeToday');
const Alert = require('../models/alert.model');

/**
 * Initializes Socket.IO event listeners and middleware.
 * @param {import('socket.io').Server} io The Socket.IO server instance.
 */
module.exports = (io) => {
    // Middleware truoc khi khoi tao ket noi
    io.use(async (socket, next) => {
        // let token = socket.handshake.auth.token; // Mo rong chua co

        const apiKey = socket.handshake.auth.apiKey;

        // handshake: Là một đối tượng chứa thông tin về "cái bắt tay" (handshake) ban đầu — tức là quá trình thiết lập kết nối. 
        // Nó chứa mọi thứ về request HTTP(S) ban đầu, bao gồm headers, địa chỉ IP, và query parameters.
        const authHeader = socket.handshake.headers['authorization'];

        try {
            if (authHeader) {
                let token;

                if (authHeader.startsWith('Bearer '))
                    token = authHeader.split(' ')[1];

                if (!token)
                    return next(new AppError('Authentication error: Token not provided.', 401));

                let decode;
                try {
                    decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                    const user = await User.findById(decode.id).select('+isActive');
                    if (!user || !user.isActive)
                        return next(new AppError('Authentication error: User not found or inactive.', 401));

                    socket.user = user;
                    return next();

                } catch (error) {
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

                // Ngưỡng báo động = Giờ dự kiến + 15 phút
                const alertThreshold = new Date(expectedTime.getTime() + LATENESS_BUFFET_MS);

                if (now > alertThreshold) {
                    console.warn(`⚠️ Trip ${trip._id} trễ giờ tới trạm ${nextStop.stationId}`);

                    await Alert.create({
                        busId: trip.busId,
                        driverId: trip.driverId,
                        message: `Xe đang trễ hơn 15 phút so với lịch trình đến trạm kế tiếp.`,
                        type: 'LATE'
                    });

                    io.to('receive_notification')
                        // Phụ huynh có thể: Nhận cảnh báo nếu xe bị trễ
                        .to(`trip_${trip._id}`)
                        .emit('alert:new', {
                            type: 'LATE',
                            message: `Xe đang trễ hơn 15 phút so với lịch trình đến trạm kế tiếp.`,
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
                    }

                } catch (error) {
                    console.error(`Lỗi khi ${socket.user.id} join phòng trip_${tripId}:`, error);
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

                    socket.routeStops = trip.routeId.orderedStops.map(stop => ({
                        id: stop._id.toString(),
                        name: stop.name,
                        lat: stop.address.latitude,
                        lng: stop.address.longitude
                    }));

                    // Sync trạng thái hiện tại từ DB vào Socket
                    socket.trackingState = {
                        nextStationIndex: trip.nextStationIndex || 0,
                        hasNotifiedApproaching: trip.hasNotifiedApproaching || false,
                        hasNotifiedArrived: trip.hasNotifiedArrived || false
                    };

                    console.log(`Xe buýt ${busId} đã BẮT ĐẦU chuyến ${socket.tripId}`);
                    socket.emit('trip:started_successfully');

                } catch (error) {
                    // Nếu .save() hoặc .findById() bị lỗi, nó sẽ nhảy vào đây
                    console.error(`Lỗi khi xe ${socket.bus.id} bắt đầu chuyến ${data.tripId}:`, error.message);
                    socket.emit('trip:error', 'Lỗi server, không thể bắt đầu chuyến đi.');
                }
            });

            const MIN_DISTANCE_THRESHOLD = 0.005; // km
            const DB_SAVE_INTERVAL_MS = 10000; // ms
            const DISTANCE_APPROACHING = 0.1; // 100m: sắp tới
            const DISTANCE_ARRIVED = 0.05;      // 50m: đã tới
            const DISTANCE_DEPARTED = 0.05;    // Đi xa trạm cũ 50m: đã rời đi

            // QUAN TRỌNG: Không cho join bất kỳ phòng nào cả
            socket.on('driver:update_location', async (data) => {
                // data format: {busId: '', coords: {latitude: '',longitude: ''}}

                // Chỉ tin vào 'bus' đax được xác thực sau Middleware tren
                const busId = socket.bus.id;
                const validatedTripId = socket.tripId;
                const newCoords = data.coords;
                const currentTime = Date.now();

                if (!validatedTripId || !socket.routeStops)
                    return; // Bỏ qua nếu xe chưa bắt đầu chuyến (start_trip)

                if (!socket.lastDbUpdatedTime)
                    socket.lastDbUpdatedTime = currentTime;

                if (!socket.prevCoords) {
                    io.to(`trip_${validatedTripId}`).emit('bus:location_changed', newCoords);

                    Bus.updateCurrentStatus(busId, newCoords)
                        .catch(err => console.error(`Lỗi cập nhật status bus ${busId}:`, err));

                    socket.lastDbUpdatedTime = currentTime;
                    socket.prevCoords = newCoords;
                    return;
                }


                // Chỉ xử lý và gửi đi khi tọa độ thực sự thay đổi
                if (Haversine.distance(socket.prevCoords, newCoords) > MIN_DISTANCE_THRESHOLD) {

                    // Uu tien 1
                    // Gui cho nhung ai dang trong phong live-map VA dang coi map
                    io.to(`trip_${validatedTripId}`).emit('bus:location_changed', newCoords);

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
                    Trip.updateMany(
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

                        // 3. Dọn dẹp
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