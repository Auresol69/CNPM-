// src/pages/driver/DriverContacts.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Phone,
  Search,
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRouteTracking } from '../../context/RouteTrackingContext';
import { getDriverContacts } from '../../api/apiClient';
import { sendChatMessage, onChatReceiveMessage, onChatError, connectSocket } from '../../services/socketService';

// Biến toàn cục để tạo ID tin nhắn duy nhất
let messageIdCounter = Date.now();
const generateUniqueId = () => {
  return ++messageIdCounter;
};

export default function DriverContacts() {
  const {
    isTracking,
    currentStation,
    studentCheckIns,
  } = useRouteTracking();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messageSearch, setMessageSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]); // ← Store parent contacts from API

  const [messages, setMessages] = useState({
    admin: [
      { id: 1, sender: 'admin', text: 'Chuyến đi hôm nay thế nào anh?', time: '07:20' },
      { id: 2, sender: 'driver', text: 'Dạ đang chạy tốt ạ!', time: '07:22' },
    ],
  });

  const messagesEndRef = useRef(null);

  // ✅ Load contacts from API
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        console.log('[DriverContacts] Fetching contacts from API...');
        const response = await getDriverContacts();
        console.log('[DriverContacts] API response:', response);

        // Transform backend format to UI format
        const contactsData = response.data?.data || [];

        // Flatten: each student becomes a separate contact record
        const flatContacts = [];
        contactsData.forEach(parent => {
          parent.students.forEach(student => {
            flatContacts.push({
              id: student.studentId,
              name: student.studentName,
              class: student.grade,
              parentId: parent.parentId,
              parentName: parent.parentName,
              parentPhone: parent.phoneNumber,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentName}`,
            });
          });
        });

        setContacts(flatContacts);
        console.log('[DriverContacts] ✅ Loaded', flatContacts.length, 'contacts');
      } catch (err) {
        console.error('[DriverContacts] Failed to load contacts:', err);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // ✅ Socket chat listeners
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      console.log('[DriverContacts] ✅ Received message:', message);

      // Determine thread ID and sender type based on message structure
      let threadId;
      let senderType;

      // Check if sender is a parent in our contacts list
      const parentContact = message.senderId
        ? contacts.find(c => c.parentId === message.senderId)
        : null;

      if (parentContact) {
        // Message from a parent
        threadId = `parent-${parentContact.id}`;
        senderType = 'parent';
      } else {
        // Message not from a known parent → must be from Admin/Manager
        // Or message.receiverId is null (meaning it was sent TO admin room)
        threadId = 'admin';
        senderType = message.senderId ? 'admin' : 'driver'; // If no senderId, it's echoing our own message
      }

      // Add to messages
      const msg = {
        id: message._id || Date.now(),
        sender: senderType,
        text: message.content,
        time: new Date(message.createdAt || Date.now()).toTimeString().slice(0, 5),
      };

      setMessages(prev => {
        const updated = { ...prev };
        if (!updated[threadId]) updated[threadId] = [];
        // Check if message already exists
        if (!updated[threadId].some(m => m.id === msg.id)) {
          updated[threadId] = [...updated[threadId], msg];
        }
        return updated;
      });
    };

    const handleChatError = (error) => {
      console.error('[DriverContacts] ❌ Chat error:', error);
      alert('Lỗi gửi tin nhắn: ' + error);
    };

    onChatReceiveMessage(handleReceiveMessage);
    onChatError(handleChatError);

    return () => {
      if (socket) {
        socket.off('chat:receive_message', handleReceiveMessage);
        socket.off('chat:error', handleChatError);
      }
    };
  }, [contacts]);

  // Load tin nhắn từ localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('chat_messages');
      if (raw) {
        const store = JSON.parse(raw);
        setMessages(prev => {
          const merged = { ...prev };
          Object.keys(store).forEach(thread => {
            if (!merged[thread]) merged[thread] = [];
            const existingIds = new Set(merged[thread].map(m => m.id));
            store[thread].forEach(m => {
              if (!existingIds.has(m.id)) {
                merged[thread].push(m);
                // Cập nhật counter để tránh trùng
                if (m.id > messageIdCounter) messageIdCounter = m.id;
              }
            });
          });
          return merged;
        });
      }
    } catch (e) {
      console.error('Lỗi đọc tin nhắn từ localStorage', e);
    }
  }, []);

  // Lắng nghe tin nhắn từ các component khác
  useEffect(() => {
    const handler = (e) => {
      try {
        const { threadId, message } = e.detail || {};
        if (!threadId || !message) return;
        setMessages(prev => {
          const copy = { ...prev };
          const existingIds = new Set((copy[threadId] || []).map(m => m.id));
          if (!existingIds.has(message.id)) {
            copy[threadId] = [...(copy[threadId] || []), message];
          }
          return copy;
        });
      } catch (err) {
        console.error('Lỗi nhận tin nhắn broadcast', err);
      }
    };
    window.addEventListener('chat_message', handler);
    return () => window.removeEventListener('chat_message', handler);
  }, []);

  // Cuộn xuống cuối khi có tin mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  // Tìm kiếm học sinh
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return contacts;
    const lower = searchTerm.toLowerCase();
    return contacts.filter(s =>
      s.name.toLowerCase().includes(lower) ||
      s.class?.toLowerCase().includes(lower) ||
      s.parentName?.toLowerCase().includes(lower) ||
      s.parentPhone?.includes(searchTerm)
    );
  }, [searchTerm, contacts]);

  // Trạng thái học sinh
  const getStudentStatus = (studentId) => {
    if (!isTracking) return 'waiting';
    const status = studentCheckIns[studentId];
    if (status === 'present') return 'onboard';
    if (status === 'absent') return 'absent';
    return 'late';
  };

  const getStatusBadge = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-bold';
    switch (status) {
      case 'onboard': return <span className={`${base} bg-green-100 text-green-800`}>Đã lên</span>;
      case 'absent': return <span className={`${base} bg-red-100 text-red-800`}>Vắng</span>;
      case 'late': return <span className={`${base} bg-yellow-100 text-yellow-800`}>Trễ</span>;
      default: return <span className={`${base} bg-gray-100 text-gray-700`}>Chưa</span>;
    }
  };

  // Mở chat
  const openChat = (chatId) => {
    setActiveChat(chatId);
    setIsChatOpen(true);
    setMessageSearch('');
    setNewMessage('');
  };

  // ✅ Gửi tin nhắn - Socket + localStorage
  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const now = new Date().toTimeString().slice(0, 5);
    const msg = {
      id: generateUniqueId(),
      sender: 'driver',
      text: newMessage.trim(),
      time: now,
    };

    // Update state immediately (optimistic UI)
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), msg]
    }));

    // ✅ Emit socket event - chỉ gửi cho admin
    if (activeChat === 'admin') {
      sendChatMessage(null, newMessage.trim());
    }

    // Save to localStorage for persistence
    try {
      const KEY = 'chat_messages';
      const raw = localStorage.getItem(KEY);
      const store = raw ? JSON.parse(raw) : {};
      if (!store[activeChat]) store[activeChat] = [];

      if (!store[activeChat].some(m => m.id === msg.id)) {
        store[activeChat].push(msg);
        localStorage.setItem(KEY, JSON.stringify(store));
      }

      window.dispatchEvent(new CustomEvent('chat_message', {
        detail: { threadId: activeChat, message: msg }
      }));
    } catch (e) {
      console.error('Lỗi lưu tin nhắn', e);
    }

    setNewMessage('');
  };

  const currentMessages = activeChat ? messages[activeChat] || [] : [];
  const filteredMessages = useMemo(() => {
    if (!messageSearch) return currentMessages;
    const lower = messageSearch.toLowerCase();
    return currentMessages.filter(m => m.text.toLowerCase().includes(lower));
  }, [currentMessages, messageSearch]);

  const getChatTitle = () => {
    return 'Chat với Quản Lý (Admin)';
  };

  // Loading & Empty state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-xl font-medium text-indigo-700">Đang tải danh bạ...</p>
        </div>
      </div>
    );
  }

  if (!loading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
          <AlertCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Chưa có dữ liệu liên hệ</h2>
          <p className="text-gray-600 mb-6">Không thể tải danh sách phụ huynh. Vui lòng thử lại.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Phone className="w-12 h-12" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Danh Bạ & Tin Nhắn</h1>
                <p className="text-base opacity-90">Gọi điện • Chat nhanh với phụ huynh & quản lý</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Trạng thái chuyến</div>
              <div className="text-xl font-bold mt-1">
                {isTracking ? 'ĐANG CHẠY' : 'CHƯA BẮT ĐẦU'}
              </div>
              <div className="text-sm opacity-90 mt-1">
                Trạm hiện tại: <strong>{currentStation?.name || '—'}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-1 gap-6">
          {/* Chat với Admin */}
          <button
            onClick={() => openChat('admin')}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl py-5 shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4 text-xl font-bold"
          >
            <MessageCircle className="w-10 h-10" />
            Chat với Quản Lý (Admin)
          </button>

          {/* Danh sách phụ huynh */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-indigo-100">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="text"
                placeholder="Tìm học sinh, phụ huynh, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 text-lg rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <p className="text-center py-12 text-gray-500 text-lg">Không tìm thấy học sinh nào</p>
              ) : (
                filteredStudents.map((student) => {
                  const status = getStudentStatus(student.id);
                  return (
                    <div
                      key={student.id} // ← Key luôn là student.id → duy nhất
                      className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all flex items-center justify-between border-2 border-white/50"
                    >
                      <div className="flex items-center gap-5">
                        <img
                          src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                          alt={student.name}
                          className="w-16 h-16 rounded-full ring-4 ring-white shadow-xl"
                        />
                        <div>
                          <div className="font-bold text-lg">{student.name}</div>
                          <div className="text-sm text-gray-600">
                            {student.class} • PH: <strong>{student.parentName}</strong>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{student.parentPhone}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(status)}
                        <a
                          href={`tel:${student.parentPhone}`}
                          className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:scale-110 transition"
                        >
                          <Phone className="w-6 h-6" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* MODAL CHAT */}
        {isChatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border-8 border-indigo-100">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full hover:bg-white/20 transition">
                    <ArrowLeft className="w-7 h-7" />
                  </button>
                  <h2 className="text-2xl font-bold">{getChatTitle()}</h2>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full hover:bg-white/20 transition">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="p-4 border-b bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm trong cuộc trò chuyện..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filteredMessages.length === 0 ? (
                  <p className="text-center text-gray-500 text-lg py-20">Chưa có tin nhắn</p>
                ) : (
                  filteredMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs md:max-w-md px-5 py-3 rounded-3xl shadow-lg ${msg.sender === 'driver'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : msg.sender === 'admin'
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                        }`}>
                        {msg.sender === 'admin' && (
                          <p className="text-xs font-semibold text-teal-100 mb-1">Quản lý</p>
                        )}
                        <p className="text-base">{msg.text}</p>
                        <p className={`text-xs mt-2 opacity-80 ${msg.sender === 'driver'
                          ? 'text-indigo-200'
                          : msg.sender === 'admin'
                            ? 'text-teal-100'
                            : 'text-gray-500'
                          }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-5 border-t bg-gray-50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 focus:border-indigo-500 focus:outline-none text-lg"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 text-white rounded-full font-bold shadow-xl hover:scale-110 transition flex items-center gap-3"
                  >
                    <Send className="w-6 h-6" />
                    Gửi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}