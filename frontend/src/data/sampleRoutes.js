// src/data/sampleRoutes.js
export const SAMPLE_ROUTES = [
  {
    id: "r1",
    name: "Tuyến sáng - Quận 3 → THPT Lê Quý Đôn",
    driver: "Nguyễn Văn Tài",
    bus: "59A-56789 (48 chỗ)",
    totalStudents: 26,
    duration: "25 phút",
    rawPath: [
      [10.76262, 106.66017],  // Nguyễn Trãi
      [10.7645, 106.6678],    // Lê Văn Sỹ
      [10.7712, 106.6785],   // Trường Chinh
      [10.7789, 106.6890],   // Cách Mạng Tháng Tám
      [10.7801, 106.6952],   // Lê Quý Đôn (đích)
    ],
    stations: [
      { id: "s1", name: "Trạm Nguyễn Trãi", lat: 10.76262, lng: 106.66017, time: "06:35", students: 8 },
      { id: "s2", name: "Trạm Lê Văn Sỹ", lat: 10.7645, lng: 106.6678, time: "06:42", students: 10 },
      { id: "s3", name: "Trạm Trường Chinh", lat: 10.7712, lng: 106.6785, time: "06:50", students: 5 },
      { id: "s4", name: "THPT Lê Quý Đôn", lat: 10.7801, lng: 106.6952, time: "07:05", students: 3 },
    ]
  }
];