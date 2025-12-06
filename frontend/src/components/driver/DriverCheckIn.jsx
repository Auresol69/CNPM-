// src/components/driver/DriverCheckIn.jsx
import { Camera, CheckCircle, UserCheck, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { checkIn, checkInWithFace, markAsAbsent } from '../../services/tripService';

export default function DriverCheckIn({ trip, students = [], onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFaceModal, setShowFaceModal] = useState(false);

  const handleCheckIn = async (student, stationId) => {
    try {
      setLoading(true);
      await checkIn(trip._id, {
        studentId: student._id || student.id,
        stationId: stationId || student.station?._id,
        timestamp: new Date().toISOString()
      });
      
      if (onUpdate) onUpdate();
      alert(`✓ Đã check-in ${student.student?.name || student.name}`);
    } catch (error) {
      alert(`Lỗi check-in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async (student) => {
    if (!confirm(`Xác nhận đánh dấu ${student.student?.name || student.name} vắng mặt?`)) {
      return;
    }

    try {
      setLoading(true);
      await markAsAbsent(trip._id, student._id || student.id);
      
      if (onUpdate) onUpdate();
      alert(`✓ Đã đánh dấu vắng mặt ${student.student?.name || student.name}`);
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCheckIn = (student) => {
    setSelectedStudent(student);
    setShowFaceModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedStudent) return;

    try {
      setLoading(true);
      const stationId = selectedStudent.station?._id || selectedStudent.stationId;
      await checkInWithFace(trip._id, file, stationId);
      
      if (onUpdate) onUpdate();
      alert(`✓ Check-in Face ID thành công!`);
      setShowFaceModal(false);
      setSelectedStudent(null);
    } catch (error) {
      alert(`Lỗi Face ID: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const waitingStudents = students.filter(s => 
    s.checkInStatus === 'waiting' || !s.checkInStatus
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-700">
          <UserCheck className="w-8 h-8" /> Check-in học sinh
        </h2>
        <span className="text-lg font-medium text-gray-600">
          Còn {waitingStudents.length} em
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {waitingStudents.map((student) => {
          const studentId = student._id || student.id;
          const studentName = student.student?.name || student.name || 'N/A';
          const studentClass = student.student?.class || student.class || '';

          return (
            <div
              key={studentId}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{studentName}</div>
                  <div className="text-sm text-gray-600">Lớp {studentClass}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFaceCheckIn(student)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 transition disabled:bg-gray-400"
                >
                  <Camera className="w-5 h-5" />
                  Face ID
                </button>
                
                <button
                  onClick={() => handleCheckIn(student, student.station?._id)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2 transition disabled:bg-gray-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  Đón
                </button>
                
                <button
                  onClick={() => handleMarkAbsent(student)}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2 transition disabled:bg-gray-400"
                >
                  <XCircle className="w-5 h-5" />
                  Vắng
                </button>
              </div>
            </div>
          );
        })}

        {waitingStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium">Đã check-in hết học sinh!</p>
          </div>
        )}
      </div>

      {/* Face ID Modal */}
      {showFaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                Check-in Face ID - {selectedStudent?.student?.name || selectedStudent?.name}
              </h3>
              <button
                onClick={() => {
                  setShowFaceModal(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Chụp ảnh hoặc tải lên ảnh khuôn mặt học sinh
                </p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>

              {loading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Đang xử lý...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
