// // src/context/AuthProvider.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from './AuthContext';

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const saved = localStorage.getItem('busUser');
//     if (saved) {
//       try {
//         setUser(JSON.parse(saved));
//       } catch {
//         localStorage.removeItem('busUser');
//       }
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData) => {
//     const userInfo = {
//       id: Date.now(),
//       name: userData.name,
//       role: userData.role,
//       phone: userData.phone || '',
//       vehicle: userData.vehicle || null,
//       avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`,
//     };

//     setUser(userInfo);
//     localStorage.setItem('busUser', JSON.stringify(userInfo));

//     const redirect = {
//       driver: '/driver',
//       parent: '/parent',
//       manager: '/manager/dashboard',
//     };
//     navigate(redirect[userInfo.role] || '/', { replace: true });
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('busUser');
//     navigate('/login', { replace: true });
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     loading,
//     isAuthenticated: !!user,
//     isDriver: user?.role === 'driver',
//     isParent: user?.role === 'parent',
//     isManager: user?.role === 'manager',
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }
// src/context/AuthProvider.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logOut as apiLogOut, getCurrentUser, getToken } from '../services/authService';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token và user từ localStorage
    const token = getToken();
    const savedUser = getCurrentUser();
    
    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Hàm này dùng cho old mock data compatibility
    // Login thật được xử lý trong login.jsx
    const userInfo = {
      _id: userData._id || userData.id || Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || '',
      avatar: userData.avatar || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`,
    };

    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('busUser', JSON.stringify(userInfo)); // Backward compatibility

    const redirect = {
      Driver: '/driver',
      Parent: '/parent/dashboard',
      Manager: '/manager/dashboard',
      Admin: '/manager/dashboard',
    };
    navigate(redirect[userInfo.role] || '/', { replace: true });
  };

  const logout = async () => {
    try {
      await apiLogOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('busUser'); // Backward compatibility
      navigate('/login', { replace: true });
    }
  };

  // Hàm update user sau khi fetch từ API
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
    localStorage.setItem('busUser', JSON.stringify(newUserData)); // Backward compatibility
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user && !!getToken(),
    isDriver: user?.role === 'Driver' || user?.role === 'driver',
    isParent: user?.role === 'Parent' || user?.role === 'parent',
    isManager: user?.role === 'Manager' || user?.role === 'manager' || user?.role === 'Admin',
    isAdmin: user?.role === 'Admin',
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
