import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import logo from '../../assets/logo.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Removed auto-redirect - always show login form when user selects Parent role

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
        msg = 'Sai thông tin đăng nhập. Vui lòng kiểm tra lại (012012 / 123).';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Hero / Brand */}
        <div className="md:w-1/2 bg-orange-500 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-black/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg overflow-hidden">
                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Smart School Bus</h1>
                <p className="text-orange-100">Hệ thống theo dõi xe đưa đón học sinh an toàn, tin cậy.</p>
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
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              <p><strong>Lỗi:</strong> {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản / SĐT</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-95 flex justify-center items-center ${
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
            

          </form>
        </div>
      </div>
    </div>
  );
}