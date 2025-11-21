exports = async function () {
    const service = context.services.get("SSB");
    const db = service.db("SmartSchoolBus");

    const schedulesCollection = db.collection("schedules");
    const busesCollection = db.collection("buses");
    const tripsCollection = db.collection("trips");

    // 1. Setup ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log("------------- START DAILY JOB -------------");
    console.log(`📅 Today (UTC Start of Day): ${today.toISOString()}`);

    // 2. Tìm Active Bus IDs
    // Thêm điều kiện startDate <= today nếu muốn xe chỉ assigned khi lịch ĐÃ bắt đầu
    const query = {
        "isActive": true,
        "endDate": { "$gte": today }
    };

    console.log(`🔍 Query tìm xe đang bận: ${JSON.stringify(query)}`);

    // Lấy danh sách ID
    const activeBusIds = await schedulesCollection.distinct("busId", query);
    
    console.log(`🚌 Tìm thấy ${activeBusIds.length} xe đang có lịch trình.`);
    // Log ra danh sách ID để bạn copy check trong Database
    console.log(`📋 Danh sách BusID Active: ${JSON.stringify(activeBusIds)}`);

    // 3. Cập nhật Buses
    // Lệnh A: Set True
    const assignResult = await busesCollection.updateMany(
        { "_id": { "$in": activeBusIds } },
        { "$set": { "isAssigned": true } }
    );
    console.log(`✅ Set Assigned=TRUE: ${assignResult.modifiedCount} xe (Matched: ${assignResult.matchedCount})`);

    // Lệnh B: Set False
    const unassignResult = await busesCollection.updateMany(
        { "_id": { "$nin": activeBusIds } },
        { "$set": { "isAssigned": false } }
    );
    console.log(`🆓 Set Assigned=FALSE: ${unassignResult.modifiedCount} xe (Matched: ${unassignResult.matchedCount})`);

    // 4. Dọn dẹp Trips cũ
    const autoCancelledResult = await tripsCollection.updateMany(
        {
            "status": 'NOT_STARTED',
            "tripDate": { "$lt": today }
        },
        { "$set": { "status": 'CANCELLED' } }
    );
    console.log(`🚫 Auto CANCELLED: ${autoCancelledResult.modifiedCount} chuyến.`);

    const autoCompletedResult = await tripsCollection.updateMany(
        {
            "status": 'IN_PROGRESS',
            "tripDate": { "$lt": today }
        },
        { "$set": { "status": 'COMPLETED' } }
    );
    console.log(`🏁 Auto COMPLETED: ${autoCompletedResult.modifiedCount} chuyến.`);

    console.log("------------- END JOB -------------");

    return {
        activeBusIdsCount: activeBusIds.length,
        assigned: assignResult.modifiedCount,
        unassigned: unassignResult.modifiedCount,
        cancelledTrip: autoCancelledResult.modifiedCount,
        completedTrip: autoCompletedResult.modifiedCount
    };
};