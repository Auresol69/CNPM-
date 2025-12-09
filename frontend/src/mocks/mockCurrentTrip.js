// src/mocks/mockCurrentTrip.js

const mockCurrentTrip = {
  // Thông tin chuyến đi hiện tại (đang chạy)
  _id: "trip001",
  direction: "PICK_UP",
  status: "IN_PROGRESS",
  tripDate: new Date().toISOString(),
  startTime: "06:30",
  currentStationIndex: 2, // Đang ở trạm thứ 3 (index = 2)
  totalStudents: 28,
  checkedInCount: 19,

  // Thông tin tuyến đường
  route: {
    _id: "route001",
    name: "Tuyến A1 - Quận 7 → Trường THCS Lê Quý Đôn",
    direction: "PICK_UP"
  },

  // Danh sách các trạm dừng (stations/stops)
  stops: [
    {
      _id: "stop001",
      name: "Cư xá Phú Mỹ",
      time: "06:30",
      position: [10.7294, 106.7278],
      order: 1,
      students: ["s1", "s2", "s3", "s4"] // ID học sinh đón tại trạm này
    },
    {
      _id: "stop002",
      name: "Him Lam KĐT (Cổng chính)",
      time: "06:38",
      position: [10.7381, 106.7245],
      order: 2,
      students: ["s5", "s6", "s7", "s8", "s9"]
    },
    {
      _id: "stop003",
      name: "Sunrise City - View sông",
      time: "06:45",
      position: [10.7452, 106.7221],
      order: 3,
      students: ["s10", "s11", "s12", "s13", "s14", "s15"]
    },
    {
      _id: "stop004",
      name: "The Vista An Phú",
      time: "06:55",
      position: [10.7901, 106.7489],
      order: 4,
      students: ["s16", "s17", "s18"]
    },
    {
      _id: "stop005",
      name: "Trường THCS Lê Quý Đôn (Cổng chính)",
      time: "07:10",
      position: [10.7623, 106.7056],
      order: 5,
      students: [] // Trạm trường - không đón
    }
  ],

  // Danh sách học sinh trên xe (của toàn chuyến)
  students: [
    { id: "s1", name: "Nguyễn Minh Anh", avatar: "https://i.pravatar.cc/150?img=1", status: "present" },
    { id: "s2", name: "Trần Bảo Long", avatar: "https://i.pravatar.cc/150?img=2", status: "present" },
    { id: "s3", name: "Lê Thị Hồng Ngọc", avatar: "https://i.pravatar.cc/150?img=3", status: "present" },
    { id: "s4", name: "Phạm Quốc Huy", avatar: "https://i.pravatar.cc/150?img=4", status: "absent" },

    { id: "s5", name: "Vũ Ngọc Mai", avatar: "https://i.pravatar.cc/150?img=5", status: "present" },
    { id: "s6", name: "Đỗ Minh Khang", avatar: "https://i.pravatar.cc/150?img=6", status: "present" },
    { id: "s7", name: "Hoàng Yến Nhi", avatar: "https://i.pravatar.cc/150?img=7", status: "present" },
    { id: "s8", name: "Bùi Thiên Ân", avatar: "https://i.pravatar.cc/150?img=8", status: "present" },
    { id: "s9", name: "Lý Gia Bảo", avatar: "https://i.pravatar.cc/150?img=9", status: "present" },

    { id: "s10", name: "Trương Bảo Châu", avatar: "https://i.pravatar.cc/150?img=10", status: "present" },
    { id: "s11", name: "Huỳnh Anh Thư", avatar: "https://i.pravatar.cc/150?img=11", status: "present" },
    { id: "s12", name: "Đặng Nhật Minh", avatar: "https://i.pravatar.cc/150?img=12", status: "present" },
    { id: "s13", name: "Ngô Bảo Khánh", avatar: "https://i.pravatar.cc/150?img=13", status: "present" },
    { id: "s14", name: "Phan Ngọc Ánh", avatar: "https://i.pravatar.cc/150?img=14", status: "present" },
    { id: "s15", name: "Võ Hoàng Nam", avatar: "https://i.pravatar.cc/150?img=15", status: "absent" },

    { id: "s16", name: "Kim Tú Linh", avatar: "https://i.pravatar.cc/150?img=16", status: null },
    { id: "s17", name: "Tạ Phong Đăng", avatar: "https://i.pravatar.cc/150?img=17", status: null },
    { id: "s18", name: "Hà Minh Triết", avatar: "https://i.pravatar.cc/150?img=18", status: null },

    // Thêm vài em để đủ 28
    { id: "s19", name: "Mai Anh Thư", avatar: "https://i.pravatar.cc/150?img=19", status: "present" },
    { id: "s20", name: "Lê Quốc Anh", avatar: "https://i.pravatar.cc/150?img=20", status: "present" },
    { id: "s21", name: "Trần Ngọc Mai", avatar: "https://i.pravatar.cc/150?img=21", status: "present" },
    { id: "s22", name: "Nguyễn Phúc Vinh", avatar: "https://i.pravatar.cc/150?img=22", status: "present" },
    { id: "s23", name: "Đinh Bảo Ngọc", avatar: "https://i.pravatar.cc/150?img=23", status: "present" },
    { id: "s24", name: "Hồ Gia Huy", avatar: "https://i.pravatar.cc/150?img=24", status: "present" },
    { id: "s25", name: "Cao Thiên Kim", avatar: "https://i.pravatar.cc/150?img=25", status: "present" },
    { id: "s26", name: "Dương Bảo Trâm", avatar: "https://i.pravatar.cc/150?img=26", status: "present" },
    { id: "s27", name: "Lương Yến Nhi", avatar: "https://i.pravatar.cc/150?img=27", status: "present" },
    { id: "s28", name: "Tô Minh Khôi", avatar: "https://i.pravatar.cc/150?img=28", status: "present" }
  ],

  // Xe buýt
  bus: {
    _id: "bus001",
    licensePlate: "51B-123.45",
    type: "45 chỗ"
  },

  // Tài xế
  driver: {
    name: "Nguyễn Văn Tài",
    phone: "0909123456"
  }
};

export default mockCurrentTrip;