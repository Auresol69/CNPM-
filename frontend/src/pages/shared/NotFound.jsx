// src/pages/shared/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                <AlertTriangle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Không tìm thấy trang</h2>
                <p className="text-gray-600 mb-6">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
                <Link
                    to="/driver"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                    <Home className="w-5 h-5" />
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}
