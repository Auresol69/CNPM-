// src/mocks/mockSchedule.js

const mockSchedule = [
  {
    _id: "trip001",
    direction: "PICK_UP",
    status: "IN_PROGRESS",
    tripDate: new Date().toISOString(),
    startTime: "06:30",
    scheduleId: {
      routeId: {
        _id: "route001",
        name: "Tuyến A1 - Quận 7 → Trường THCS Lê Quý Đôn"
      }
    },
    busId: {
      _id: "bus001",
      licensePlate: "51B-123.45"
    },
    driverId: {
      name: "Nguyễn Văn Tài"
    },
    totalStudents: 28
  },
  {
    _id: "trip002",
    direction: "DROP_OFF",
    status: "PENDING",
    tripDate: new Date().toISOString(),
    startTime: "16:45",
    scheduleId: {
      routeId: {
        _id: "route001",
        name: "Tuyến A1 - Trường THCS Lê Quý Đôn → Quận 7"
      }
    },
    busId: {
      _id: "bus001",
      licensePlate: "51B-123.45"
    },
    driverId: {
      name: "Nguyễn Văn Tài"
    },
    totalStudents: 27
  },
  {
    _id: "trip003",
    direction: "PICK_UP",
    status: "COMPLETED",
    tripDate: new Date(Date.now() - 86400000).toISOString(), // hôm qua
    startTime: "06:30",
    scheduleId: {
      routeId: {
        _id: "route002",
        name: "Tuyến B2 - Thủ Đức → Trường Tiểu học Kim Đồng"
      }
    },
    busId: {
      _id: "bus002",
      licensePlate: "51B-678.90"
    },
    totalStudents: 32
  },
  {
    _id: "trip004",
    direction: "PICK_UP",
    status: "PENDING",
    tripDate: new Date().toISOString(),
    startTime: "06:15",
    scheduleId: {
      routeId: {
        _id: "route003",
        name: "Tuyến C3 - Bình Thạnh → Trường THPT Marie Curie"
      }
    },
    busId: {
      _id: "bus003",
      licensePlate: "51B-555.66"
    },
    totalStudents: 25
  },
  {
    _id: "trip005",
    direction: "DROP_OFF",
    status: "COMPLETED",
    tripDate: new Date().toISOString(),
    startTime: "17:00",
    scheduleId: {
      routeId: {
        _id: "route003",
        name: "Tuyến C3 - Trường THPT Marie Curie → Bình Thạnh"
      }
    },
    busId: {
      _id: "bus003",
      licensePlate: "51B-555.66"
    },
    totalStudents: 24
  },
  {
    _id: "trip006",
    direction: "PICK_UP",
    status: "IN_PROGRESS",
    tripDate: new Date().toISOString(),
    startTime: "06:45",
    scheduleId: {
      routeId: {
        _id: "route004",
        name: "Tuyến D4 - Gò Vấp → Trường THCS Nguyễn Du"
      }
    },
    busId: {
      _id: "bus004",
      licensePlate: "51B-999.88"
    },
    totalStudents: 30
  },
  {
    _id: "trip007",
    direction: "PICK_UP",
    status: "PENDING",
    tripDate: new Date(Date.now() + 86400000).toISOString(), // ngày mai
    startTime: "06:30",
    scheduleId: {
      routeId: {
        _id: "route001",
        name: "Tuyến A1 - Quận 7 → Trường THCS Lê Quý Đôn"
      }
    },
    busId: {
      _id: "bus001",
      licensePlate: "51B-123.45"
    },
    totalStudents: 28
  },
  {
    _id: "trip008",
    direction: "DROP_OFF",
    status: "PENDING",
    tripDate: new Date().toISOString(),
    startTime: "17:15",
    scheduleId: {
      routeId: {
        _id: "route005",
        name: "Tuyến E5 - Tân Bình → Trường THPT Trần Hưng Đạo"
      }
    },
    busId: {
      _id: "bus005",
      licensePlate: "51B-777.33"
    },
    totalStudents: 22
  },
  {
    _id: "trip009",
    direction: "PICK_UP",
    status: "CANCELLED",
    tripDate: new Date().toISOString(),
    startTime: "06:30",
    scheduleId: {
      routeId: {
        _id: "route006",
        name: "Tuyến F6 - Quận 9 → Trường THCS Hoa Lư"
      }
    },
    busId: {
      _id: "bus006",
      licensePlate: "51B-444.22"
    },
    totalStudents: 0
  },
  {
    _id: "trip010",
    direction: "DROP_OFF",
    status: "PENDING",
    tripDate: new Date(Date.now() + 172800000).toISOString(), // ngày kia
    startTime: "16:30",
    scheduleId: {
      routeId: {
        _id: "route002",
        name: "Tuyến B2 - Trường Tiểu học Kim Đồng → Thủ Đức"
      }
    },
    busId: {
      _id: "bus002",
      licensePlate: "51B-678.90"
    },
    totalStudents: 31
  }
];

export default mockSchedule;