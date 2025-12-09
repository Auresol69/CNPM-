// // src/components/driver/StudentList.jsx
// import React from 'react';

// export default function StudentList({ students = [] }) {
//   return (
//     <div className="bg-white rounded-md shadow p-4 border">
//       <h3 className="font-semibold mb-3">Danh sách học sinh</h3>
//       <div className="space-y-2 max-h-64 overflow-auto">
//         {students.map(s => (
//           <div key={s.id} className="flex items-center justify-between">
//             <div>
//               <div className="font-medium">{s.name}</div>
//               <div className="text-xs text-gray-500">Trường: {s.school}</div>
//             </div>
//             <div className="text-xs text-gray-600">Trạm: {s.stopName}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
export default function StudentList({ students = [], onCheckIn, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 mt-3">Đang tải danh sách học sinh...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Không có học sinh trong chuyến đi này</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Danh sách học sinh ({students.length})</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {students.map((s) => {
          const studentId = s._id || s.id;
          const studentName = s.student?.name || s.name || 'N/A';
          const studentClass = s.student?.class || s.class || '';
          const studentGrade = s.student?.grade || s.grade || '';
          const status = s.checkInStatus || s.status || 'waiting';
          const stopName = s.station?.name || s.stopName || '';

          return (
            <div key={studentId} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                  ${status === 'present' || status === 'onboard' ? 'bg-green-500' : 
                    status === 'absent' ? 'bg-red-500' : 'bg-gray-400'}
                `}>
                  {studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{studentName}</div>
                  <div className="text-xs text-gray-500">
                    {studentGrade && `${studentGrade} - `}
                    {studentClass && `Lớp ${studentClass}`}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium text-gray-700">{stopName}</div>
                <div className={`text-xs font-medium ${
                  status === 'present' || status === 'onboard' ? 'text-green-600' : 
                  status === 'absent' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {status === 'present' || status === 'onboard' ? '✓ Đã lên xe' : 
                   status === 'absent' ? '✗ Vắng mặt' : 'Chờ đón'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
