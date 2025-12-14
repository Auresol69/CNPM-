import React, { useRef, useEffect, useState } from 'react';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { checkInWithFace } from '../../services/tripService';

export default function FaceIDCheckin({ student, onCheckIn, isCheckedIn, tripId, stationId }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [resultMessage, setResultMessage] = useState(null);

    useEffect(() => {
        if (!isCameraActive) return;

        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraError(null);
                    setResultMessage(null);
                }
            } catch (err) {
                setCameraError('Không thể truy cập camera: ' + err.message);
                setIsCameraActive(false);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCameraActive]);

    const handleCaptureFace = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        if (!tripId) {
            setCameraError('Không tìm thấy thông tin chuyến đi. Vui lòng thử lại.');
            return;
        }

        setIsProcessing(true);
        setResultMessage(null);
        setCameraError(null);

        try {
            // Capture image from video
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);

            // Convert canvas to Blob (File)
            const blob = await new Promise((resolve, reject) => {
                canvasRef.current.toBlob(
                    (b) => b ? resolve(b) : reject(new Error('Không thể tạo ảnh')),
                    'image/jpeg',
                    0.9
                );
            });

            // Create File object from blob
            const imageFile = new File([blob], `face-checkin-${Date.now()}.jpg`, { type: 'image/jpeg' });

            // Call API to check-in with face
            console.log('[FaceIDCheckin] Calling checkInWithFace API...', { tripId, stationId });
            const result = await checkInWithFace(tripId, imageFile, stationId);

            console.log('[FaceIDCheckin] ✅ API response:', result);

            // Success - call onCheckIn with student ID from API response
            const recognizedStudentId = result?.studentId || result?.student?._id || student?.id;
            setResultMessage({ type: 'success', text: '✅ Nhận diện thành công!' });

            // Notify parent component to refresh UI
            if (onCheckIn && recognizedStudentId) {
                console.log('[FaceIDCheckin] Calling onCheckIn with studentId:', recognizedStudentId);
                onCheckIn(recognizedStudentId);
            }

            // Close camera after short delay to show success message
            setTimeout(() => {
                setIsCameraActive(false);
                setIsProcessing(false);
                setResultMessage(null);
            }, 1500);

        } catch (err) {
            console.error('[FaceIDCheckin] ❌ Error:', err);

            // Parse backend error messages
            let errorMsg = 'Nhận diện khuôn mặt thất bại';

            if (err.message) {
                // Common error patterns from backend
                if (err.message.includes('No face')) {
                    errorMsg = '⚠️ Không phát hiện khuôn mặt';
                } else if (err.message.includes('Multiple faces')) {
                    errorMsg = '⚠️ Phát hiện nhiều khuôn mặt';
                } else if (err.message.includes('not recognized') || err.message.includes('not found')) {
                    errorMsg = '❌ Khuôn mặt không được ghi nhận';
                } else if (err.message.includes('already checked')) {
                    errorMsg = 'ℹ️ Học sinh đã check-in';
                } else {
                    errorMsg = err.message;
                }
            }

            setResultMessage({ type: 'error', text: `❌ ${errorMsg}` });
            setIsProcessing(false);
        }
    };

    if (isCheckedIn) {
        return (
            <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                <CheckCircle className="w-6 h-6" />
                Đã xác nhận
            </div>
        );
    }

    if (isCameraActive) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl p-6 max-w-md w-full">
                    <h3 className="text-2xl font-bold text-center mb-4">Quét khuôn mặt</h3>
                    <p className="text-center text-gray-600 mb-4">Học sinh: <strong>{student.name}</strong></p>

                    <div className="relative mb-6 rounded-2xl overflow-hidden bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-64 object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Face detection guide */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="border-4 border-green-400 rounded-full w-40 h-40 opacity-50"></div>
                        </div>

                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    {cameraError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {cameraError}
                        </div>
                    )}

                    {resultMessage && (
                        <div className={`px-4 py-3 rounded-lg mb-4 text-sm font-semibold text-center ${resultMessage.type === 'success'
                            ? 'bg-green-100 border border-green-400 text-green-700'
                            : 'bg-red-100 border border-red-400 text-red-700'
                            }`}>
                            {resultMessage.text}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleCaptureFace}
                            disabled={isProcessing || !!cameraError}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                        >
                            <Camera className="w-5 h-5" />
                            {isProcessing ? 'Xử lý...' : 'XÁC NHẬN'}
                        </button>
                        <button
                            onClick={() => setIsCameraActive(false)}
                            disabled={isProcessing}
                            className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsCameraActive(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition hover:scale-110"
        >
            <Camera className="w-5 h-5" />
            Face ID
        </button>
    );
}
