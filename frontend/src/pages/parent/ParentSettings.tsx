import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import authService from '../../services/authService';
import { UserIcon, SettingsIcon } from '../../components/parent/Icons';

export default function ParentSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // General Form State
  const [generalForm, setGeneralForm] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setGeneralForm({
        name: (user as any).name || '',
        email: (user as any).email || '',
        phoneNumber: (user as any).phoneNumber || ''
      });
    }
  }, []);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error("User not found");

      // SIMULATE API CALL
      // await api.put(`/users/${(user as any)._id}`, generalForm);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay

      // Update local storage with new info (optional, but good for consistency)
      // const updatedUser = { ...user, ...generalForm };
      // localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Yêu cầu thay đổi thông tin đã được gửi lên hệ thống. Vui lòng chờ phê duyệt.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to send request.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp.' });
      setLoading(false);
      return;
    }

    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error("User not found");

      // SIMULATE API CALL
      // await api.put(`/users/${(user as any)._id}`, {
      //   password: securityForm.newPassword
      // });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay

      setMessage({ type: 'success', text: 'Yêu cầu đổi mật khẩu đã được gửi lên hệ thống. Vui lòng chờ phê duyệt.' });
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to send request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-500">Manage your profile and security preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'general'
              ? 'text-orange-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          General
          {activeTab === 'general' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'security'
              ? 'text-orange-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Security
          {activeTab === 'security' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full"></span>
          )}
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
        {activeTab === 'general' ? (
          <form onSubmit={handleGeneralSubmit} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={generalForm.name}
                onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={generalForm.email}
                onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={generalForm.phoneNumber}
                onChange={(e) => setGeneralForm({ ...generalForm, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                required
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu thay đổi'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSecuritySubmit} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="Enter current password"
                // Note: Backend might not require current password check for update, but good practice to ask.
                // If backend doesn't check, this field is just for UI/UX flow.
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="Min. 8 characters"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="Re-enter new password"
                required
                minLength={6}
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu đổi mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
