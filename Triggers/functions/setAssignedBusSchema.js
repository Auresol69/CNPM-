exports = async function() {
    const service = context.services.get("SSB");

    const db = service.db("SmartSchoolBus")
    
    const schedulesCollection = db.collection("schedules");
    const busesCollection = db.collection("buses");
    
    // 1. Lấy thời điểm hiện tại (bắt đầu của ngày hôm nay)
    // Để ý đến bất kỳ lịch trình nào chưa kết thúc (endDate >= hôm nay)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Tìm TẤT CẢ các busId "nên" ở trạng thái assigned
    // Các busId có ít nhất 1 lịch trình (Schedule)
    //    a. Đang "isActive: true"
    //    b. VÀ "endDate" >= "hôm nay"
    
    // distinct là một lệnh của MongoDB dùng để lấy ra một danh sách các giá trị duy nhất (không trùng lặp)
    // của một trường (field) cụ thể, từ các document khớp với bộ lọc (filter)
    const activeBusIds = await schedulesCollection.distinct("busId", {
        "isActive": true,
        "endDate": { "$gte": today }
    });
    
    // 'activeBusIds' là một mảng, ví dụ:
    // [ ObjectId('xe_A'), ObjectId('xe_C'), ObjectId('xe_D') ]

    // Lệnh A: Gán (Assign)
    // Đặt isAssigned = true cho TẤT CẢ các xe có ID nằm trong danh sách 'activeBusIds'
    const assignResult = await busesCollection.updateMany(
        { "_id": { "$in": activeBusIds } },
        { "$set": { "isAssigned": true } }
    );

    // Lệnh B: Giải phóng (Un-assign)
    // Đặt isAssigned = false cho TẤT CẢ các xe có ID KHÔNG nằm trong danh sách 'activeBusIds'
    const unassignResult = await busesCollection.updateMany(
        { "_id": { "$nin": activeBusIds } }, // $nin = "not in"
        { "$set": { "isAssigned": false } }
    );

    return { 
        assigned: assignResult.modifiedCount,
        unassigned: unassignResult.modifiedCount 
    };
};