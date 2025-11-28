import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { BusIcon } from '../../components/parent/Icons';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/parent/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData);
      navigate('/parent/dashboard');
    } catch (err: any) {
      console.error("Login Error:", err);
      // Construct a helpful error message
      let msg = 'Đăng nhập thất bại.';
      if (err.code === "ERR_NETWORK") {
        msg = 'Lỗi kết nối server. Server có thể đang khởi động (mất ~50s) hoặc bị chặn.';
      } else if (err.response?.status === 401 || err.response?.status === 400) {
        msg = 'Sai thông tin đăng nhập. Vui lòng kiểm tra lại (123123 / 123).';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
      setLoading(true);
      try {
          await authService.loginDemo();
          navigate('/parent/dashboard');
      } finally {
          setLoading(false);
      }
  };

  const fillCredentials = () => {
    setFormData({ username: '123123', password: '123' });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Hero / Brand */}
        <div className="md:w-1/2 bg-brand-500 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-black/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white mb-6">
                    <BusIcon className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Smart School Bus</h1>
                <p className="text-brand-100">Hệ thống theo dõi xe đưa đón học sinh an toàn, tin cậy.</p>
            </div>
            
            <div className="relative z-10 mt-12">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <p className="text-white text-sm italic">"An tâm trên mọi nẻo đường đến trường của con."</p>
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập</h2>
          <p className="text-slate-500 mb-6">Nhập thông tin tài khoản để tiếp tục.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex flex-col gap-2">
              <p><strong>Lỗi:</strong> {error}</p>
              {error.includes("kết nối") && (
                 <button 
                    onClick={handleDemoLogin}
                    className="text-left text-red-700 font-bold underline hover:text-red-800"
                 >
                    👉 Bỏ qua & Vào chế độ Demo Offline
                 </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản / SĐT</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                placeholder="VD: 123123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 transition-all transform active:scale-95 flex justify-center items-center ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Đang xử lý...
                </span>
              ) : 'Đăng nhập'}
            </button>
            
            <div className="flex flex-col gap-3 mt-4 text-center">
                <button
                    type="button"
                    onClick={fillCredentials}
                    className="text-sm text-brand-600 font-medium hover:underline"
                >
                    Điền thông tin mẫu (123123 / 123)
                </button>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Hoặc</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
                >
                    Truy cập chế độ Demo (Offline)
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}