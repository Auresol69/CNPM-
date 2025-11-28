import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import { UserIcon } from '../../components/parent/Icons';

interface Student {
  _id: string;
  name: string;
  grade: string;
  pickupStopId: string; // In a real app, we might fetch the station name
  dropoffStopId: string;
}

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  avatar?: string; // Mocked
  address?: string; // Mocked
}

export default function ParentProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Get User Info
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser({
            ...(currentUser as any),
            avatar: "https://ui-avatars.com/api/?name=" + (currentUser as any).name + "&background=f97316&color=fff", // Mock Avatar
            address: "123 School Street, District 1, HCMC" // Mock Address
          });

          // 2. Get Children Info
          try {
            const res = await api.get(`/students?parentId=${(currentUser as any)._id}`);
            // Handle generic response structure: { status: "success", data: [...] } or just [...]
            const studentsData = res.data.data || res.data || [];
            if (Array.isArray(studentsData)) {
                setStudents(studentsData);
            }
          } catch (err) {
            console.error("Failed to fetch students:", err);
            // Fallback mock students if API fails (optional, but good for demo)
            setStudents([
                { _id: '1', name: 'Nguyen Van A', grade: '5A', pickupStopId: 'Station A', dropoffStopId: 'Station B' }
            ]);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-400">Loading profile...</div>;
  }

  if (!user) {
    return <div className="text-center text-red-500 mt-10">User not found. Please log in again.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center" title="Active">
                <span className="text-white text-xs">✓</span>
            </div>
        </div>
        <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-500 font-medium mt-1">{user.role} Account</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                    {user.email}
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                    {user.phoneNumber}
                </span>
            </div>
        </div>
        <button 
            onClick={() => navigate('/parent/settings')}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
        >
            Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Personal Info Column */}
          <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                      Contact Details
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Address</p>
                          <p className="text-slate-700 mt-1">{user.address}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                          <p className="text-slate-700 mt-1">{user.phoneNumber}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
                          <p className="text-slate-700 mt-1">{user.email}</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Children List Column */}
          <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                          My Children ({students.length})
                      </h3>

                  </div>

                  <div className="space-y-4">
                      {students.length > 0 ? (
                          students.map((student) => (
                              <div key={student._id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
                                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">
                                      👶
                                  </div>
                                  <div className="flex-1">
                                      <h4 className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors">{student.name}</h4>
                                      <p className="text-sm text-slate-500">Grade: {student.grade}</p>
                                  </div>
                                  <div className="text-right">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Active
                                      </span>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-8 text-slate-400">
                              No children linked to this account yet.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
