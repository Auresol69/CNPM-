import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box, Paper, Typography, Stack, Button, Chip, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, Divider, TextField, IconButton, Badge,
  CircularProgress, InputAdornment, Autocomplete, Tabs, Tab, Tooltip
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import SearchIcon from '@mui/icons-material/Search';
import { AdminService } from "../../services/admin/AdminService";
import { useNotify } from './hooks/useNotify';
import { useSocket } from './hooks/useSocket';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Tất cả, 1 = Phụ huynh, 2 = Tài xế
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  
  const notify = useNotify();
  const { socket, connected, joinUserRoom } = useSocket();

  // Lấy thông tin user hiện tại từ localStorage
  const currentUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, []);

  // Fetch messages và users
  const fetchData = async () => {
    setLoading(true);
    try {
      const [messagesData, parentsData, driversData] = await Promise.all([
        AdminService.listMessages(),
        AdminService.listParents(),
        AdminService.listDrivers()
      ]);
      
      setMessages(messagesData);
      
      // Kết hợp danh sách users
      const allUsers = [
        ...parentsData.map(p => ({ ...p, userType: 'Parent' })),
        ...driversData.map(d => ({ ...d, userType: 'Driver' }))
      ];
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching data:', error);
      notify.error('Không thể tải dữ liệu tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Join user room khi socket connected
  useEffect(() => {
    if (connected && currentUser?._id) {
      joinUserRoom(currentUser._id);
    }
  }, [connected, currentUser, joinUserRoom]);

  // Listen for new messages via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      console.log('💬 New message received:', newMessage);
      setMessages(prev => [...prev, newMessage]);
      notify.info('📩 Có tin nhắn mới!');
    };

    const handleChatError = (errorMsg) => {
      console.error('Chat error:', errorMsg);
      notify.error(errorMsg || 'Lỗi gửi tin nhắn');
    };

    socket.on('chat:receive_message', handleReceiveMessage);
    socket.on('chat:error', handleChatError);

    return () => {
      socket.off('chat:receive_message', handleReceiveMessage);
      socket.off('chat:error', handleChatError);
    };
  }, [socket, notify]);

  // Auto scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      notify.warning('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    setSending(true);
    try {
      // Gửi qua Socket.IO
      if (socket && connected) {
        socket.emit('chat:send_message', {
          receiverId: selectedReceiver?._id || null, // null = broadcast to all admins
          content: messageText.trim()
        });
        
        // Thêm tin nhắn vào local state ngay lập tức (optimistic update)
        const optimisticMessage = {
          _id: Date.now().toString(),
          senderId: currentUser,
          receiverId: selectedReceiver?._id || null,
          content: messageText.trim(),
          createdAt: new Date().toISOString(),
          isOptimistic: true
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setMessageText('');
        notify.success('Đã gửi tin nhắn');
      } else {
        // Fallback: gửi qua REST API
        const result = await AdminService.sendMessage({
          receiverId: selectedReceiver?._id,
          content: messageText.trim()
        });
        setMessages(prev => [...prev, result]);
        setMessageText('');
        notify.success('Đã gửi tin nhắn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      notify.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  // Filter users by tab and search
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Filter by tab
    if (tabValue === 1) {
      filtered = filtered.filter(u => u.userType === 'Parent');
    } else if (tabValue === 2) {
      filtered = filtered.filter(u => u.userType === 'Driver');
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phoneNumber?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [users, tabValue, searchQuery]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt || msg.sent_at).toLocaleDateString('vi-VN');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  const getRoleIcon = (role) => {
    if (role === 'Parent') return <FamilyRestroomIcon fontSize="small" />;
    if (role === 'Driver') return <DirectionsBusIcon fontSize="small" />;
    return <PersonIcon fontSize="small" />;
  };

  const getRoleColor = (role) => {
    if (role === 'Parent') return '#8b5cf6';
    if (role === 'Driver') return '#f59e0b';
    return '#6366f1';
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            💬 Tin nhắn
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Liên lạc với phụ huynh và tài xế
            </Typography>
            <Chip 
              size="small" 
              label={connected ? 'Đang kết nối' : 'Mất kết nối'}
              color={connected ? 'success' : 'error'}
              variant="outlined"
              sx={{ height: 22 }}
            />
          </Stack>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Làm mới
        </Button>
      </Stack>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        {/* Left Panel - User List */}
        <Paper 
          elevation={0} 
          sx={{ 
            width: 320, 
            borderRadius: 3, 
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Search */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>

          {/* Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            variant="fullWidth"
            sx={{ 
              borderBottom: '1px solid #e2e8f0',
              '& .MuiTab-root': { minHeight: 48, textTransform: 'none' }
            }}
          >
            <Tab icon={<GroupIcon />} label="Tất cả" iconPosition="start" />
            <Tab icon={<FamilyRestroomIcon />} label="Phụ huynh" iconPosition="start" />
            <Tab icon={<DirectionsBusIcon />} label="Tài xế" iconPosition="start" />
          </Tabs>

          {/* User List */}
          <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <React.Fragment key={user._id || idx}>
                  <ListItem
                    button
                    selected={selectedReceiver?._id === user._id}
                    onClick={() => setSelectedReceiver(user)}
                    sx={{
                      py: 1.5,
                      '&.Mui-selected': {
                        bgcolor: '#f1f5f9',
                        '&:hover': { bgcolor: '#e2e8f0' }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getRoleColor(user.userType) }}>
                        {getRoleIcon(user.userType)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {user.name}
                        </Typography>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {user.phoneNumber || user.email}
                          </Typography>
                          <Chip
                            size="small"
                            label={user.userType === 'Parent' ? 'Phụ huynh' : 'Tài xế'}
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              bgcolor: user.userType === 'Parent' ? '#f3e8ff' : '#fef3c7',
                              color: user.userType === 'Parent' ? '#7c3aed' : '#92400e'
                            }}
                          />
                        </Stack>
                      }
                    />
                  </ListItem>
                  {idx < filteredUsers.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy người dùng
                </Typography>
              </Box>
            )}
          </List>

          {/* Broadcast option */}
          <Box sx={{ p: 1.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Button
              fullWidth
              variant={selectedReceiver === null ? 'contained' : 'outlined'}
              onClick={() => setSelectedReceiver(null)}
              startIcon={<GroupIcon />}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                bgcolor: selectedReceiver === null ? '#6366f1' : 'transparent',
                '&:hover': { bgcolor: selectedReceiver === null ? '#4f46e5' : '#f1f5f9' }
              }}
            >
              Gửi cho tất cả Admin
            </Button>
          </Box>
        </Paper>

        {/* Right Panel - Chat Area */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, 
            borderRadius: 3, 
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white'
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {selectedReceiver ? getRoleIcon(selectedReceiver.userType) : <GroupIcon />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedReceiver?.name || 'Tất cả Admin'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {selectedReceiver 
                    ? `${selectedReceiver.userType === 'Parent' ? 'Phụ huynh' : 'Tài xế'} • ${selectedReceiver.phoneNumber || selectedReceiver.email}`
                    : 'Tin nhắn sẽ được gửi đến tất cả quản trị viên'
                  }
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f8fafc' }}>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <Box key={date}>
                {/* Date Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Chip 
                    label={date} 
                    size="small" 
                    sx={{ mx: 2, bgcolor: 'white', fontSize: '0.7rem' }} 
                  />
                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* Messages */}
                {msgs.map((msg, idx) => {
                  const isSentByMe = msg.senderId?._id === currentUser?._id || msg.senderId === currentUser?._id;
                  
                  return (
                    <Box
                      key={msg._id || idx}
                      sx={{
                        display: 'flex',
                        justifyContent: isSentByMe ? 'flex-end' : 'flex-start',
                        mb: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isSentByMe 
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : 'white',
                          background: isSentByMe 
                            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            : 'white',
                          color: isSentByMe ? 'white' : '#1e293b',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          borderTopRightRadius: isSentByMe ? 4 : 16,
                          borderTopLeftRadius: isSentByMe ? 16 : 4
                        }}
                      >
                        {!isSentByMe && (
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#6366f1' }}>
                            {msg.senderId?.name || 'Người dùng'}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {msg.content || msg.message_text}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 0.5, 
                            textAlign: 'right',
                            opacity: 0.7
                          }}
                        >
                          {new Date(msg.createdAt || msg.sent_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          {msg.isOptimistic && ' • Đang gửi...'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))}
            
            {messages.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <MarkChatReadIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                <Typography color="text.secondary">
                  Chưa có tin nhắn nào
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Chọn người nhận và bắt đầu cuộc trò chuyện
                </Typography>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Nhập tin nhắn..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#f8fafc'
                  }
                }}
              />
              <Tooltip title="Gửi tin nhắn (Enter)">
                <span>
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: messageText.trim() ? '#6366f1' : '#e2e8f0',
                      color: 'white',
                      '&:hover': { bgcolor: '#4f46e5' },
                      '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                    }}
                  >
                    {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Nhấn Enter để gửi • Shift + Enter để xuống dòng
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}