import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';

export default function Login_Driver() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Kiểm tra nếu đã đăng nhập thì redirect
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user.role === 'Driver') {
      navigate('/driver/home', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.username.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại');
      return;
    }
    
    if (!form.password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Backend nhận { username, password }
      // username có thể là email HOẶC phoneNumber
      const response = await api.post('/auth/signin', {
        username: form.username.trim(),
        password: form.password
      });

      console.log('✅ Driver Login response:', response.data);

      if (response.data.accessToken) {
        const user = response.data.data?.user || {};
        
        // Kiểm tra role
        if (user.role !== 'Driver') {
          setError('Tài khoản này không phải là tài xế. Vui lòng sử dụng đúng trang đăng nhập.');
          setLoading(false);
          return;
        }

        // Lưu token và user info
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('token', response.data.accessToken); // For compatibility
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('🎉 Đăng nhập thành công! Chuyển hướng...');
        
        // Chuyển hướng đến driver home
        navigate('/driver/home', { replace: true });
      } else {
        setError('Đăng nhập thất bại. Không nhận được token từ server.');
      }
    } catch (err) {
      console.error('❌ Driver Login error:', err.response?.data || err);
      
      const errorMsg = err.response?.data?.msg || 
                      err.response?.data?.message ||
                      'Email/SĐT hoặc mật khẩu không đúng';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={24}
          sx={{ 
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            bgcolor: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative top bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              background: 'linear-gradient(90deg, #f59e0b, #d97706, #b45309)'
            }}
          />

          {/* Header */}
          <Stack alignItems="center" sx={{ mb: 4 }}>
            <Box 
              sx={{ 
                width: 70, 
                height: 70, 
                bgcolor: '#f59e0b',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mb: 2,
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
              }}
            >
              <DirectionsBusIcon sx={{ fontSize: 38 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e293b' }}>
              Đăng nhập Tài xế
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
              Nhập email hoặc số điện thoại của bạn
            </Typography>
          </Stack>

          {/* Error message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: '#1e293b' }}>
              Email hoặc Số điện thoại
            </Typography>
            <TextField
              fullWidth
              name="username"
              placeholder="VD: 0901234567 hoặc driver@example.com"
              type="text"
              value={form.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#f59e0b' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: '#1e293b' }}>
              Mật khẩu
            </Typography>
            <TextField
              fullWidth
              name="password"
              placeholder="Nhập mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#f59e0b' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ mb: 3 }}
            />

            <Button 
              fullWidth 
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                bgcolor: '#f59e0b',
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                mb: 2,
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                '&:hover': { 
                  bgcolor: '#d97706',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)'
                },
                '&.Mui-disabled': {
                  bgcolor: '#e2e8f0'
                }
              }}
            >
              {loading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <span>Đang đăng nhập...</span>
                </Stack>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <Button 
              fullWidth 
              variant="text"
              onClick={() => navigate('/')}
              sx={{ 
                color: '#64748b',
                textTransform: 'none',
              }}
            >
              ← Quay lại chọn vai trò
            </Button>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
}