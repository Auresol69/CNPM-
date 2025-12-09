import React, { useRef, useEffect, useState } from 'react';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function FaceIDCheckin({ student, onCheckIn, isCheckedIn }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraError, setCameraError] = useState(null);

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

        setIsProcessing(true);
        try {
            // Capture image from video
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);

            // Simulate face detection delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real app, you would send this to a face recognition API
            // For now, we'll just mark as checked in
            onCheckIn(student.id);
            setIsCameraActive(false);

            // Show success feedback
            setTimeout(() => {
                setIsProcessing(false);
            }, 500);
        } catch (err) {
            console.error('Face capture error:', err);
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
