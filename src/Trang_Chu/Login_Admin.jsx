  import React, { useState, useEffect } from 'react'
  import { useNavigate } from 'react-router-dom'
  import {
    Box, Paper, TextField, Button, Typography, Avatar,
    InputAdornment, IconButton, Alert, CircularProgress,
    Stack, Divider, Fade, Grow
  } from '@mui/material'
  import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
  import PersonIcon from '@mui/icons-material/Person'
  import VisibilityIcon from '@mui/icons-material/Visibility'
  import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
  import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
  import SchoolIcon from '@mui/icons-material/School'
  import SecurityIcon from '@mui/icons-material/Security'
  import api from '../api/client'

  import logoImg from '../assets/logo.png';

  export default function Login_Admin() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [mounted, setMounted] = useState(false)

    // Animation on mount
    useEffect(() => {
      setMounted(true)
      
      // Kiểm tra nếu đã đăng nhập thì redirect
      const token = localStorage.getItem('accessToken')
      if (token) {
        navigate('/admin/dashboard', { replace: true })
      }
    }, [navigate])

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value })
      setError('')
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      
      // Validation
      if (!form.username. trim()) {
        setError('Vui lòng nhập email hoặc số điện thoại')
        return
      }
      
      if (!form.password) {
        setError('Vui lòng nhập mật khẩu')
        return
      }

      

      setLoading(true)
      setError('')

      try {
        // 🔴 Backend nhận { username, password }
        // username có thể là email HOẶC phoneNumber
        const response = await api.post('/auth/signin', {
          username: form.username. trim(),
          password: form.password
        })

        console.log('✅ Login response:', response.data)

        // 🔴 Backend trả về accessToken (KHÔNG phải token)
        if (response.data.accessToken) {
          // Lưu token và user info
          localStorage.setItem('accessToken', response.data.accessToken)
          localStorage. setItem('user', JSON.stringify(response.data.data?. user || {}))
          
          // Hiển thị thông báo thành công
          console.log('🎉 Đăng nhập thành công!  Chuyển hướng.. .')
          
          // Chuyển hướng đến dashboard
          navigate('/admin/dashboard', { replace: true })
        } else {
          setError('Đăng nhập thất bại.  Không nhận được token từ server.')
        }
      } catch (err) {
        console. error('❌ Login error:', err. response?.data || err)
        
        // Backend trả lỗi trong field "msg" hoặc "message"
        const errorMsg = err.response?. data?.msg || 
                        err.response?.data?.message ||
                        'Email/SĐT hoặc mật khẩu không đúng'
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    // Handle Enter key
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSubmit(e)
      }
    }

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #6366f1 100%)',
          position: 'relative',
          overflow: 'hidden',
          p: 2
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            animation: 'float 6s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: '20%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            animation: 'float 7s ease-in-out infinite'
          }}
        />

        {/* Bus Icon floating */}
        <DirectionsBusIcon 
          sx={{ 
            position: 'absolute', 
            top: '20%', 
            right: '15%', 
            fontSize: 80, 
            color: 'rgba(255,255,255,0.1)',
            animation: 'float 5s ease-in-out infinite'
          }} 
        />
        <SchoolIcon 
          sx={{ 
            position: 'absolute', 
            bottom: '25%', 
            left: '10%', 
            fontSize: 60, 
            color: 'rgba(255,255,255,0.08)',
            animation: 'float 6s ease-in-out infinite reverse'
          }} 
        />

        {/* Login Card */}
        <Grow in={mounted} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 5 },
              width: '100%',
              maxWidth: 450,
              borderRadius: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
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
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)'
              }}
            />

            {/* Logo */}
            <Fade in={mounted} timeout={1000}>
              <Box>
                <Avatar
                  variant="square" 
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'transparent',
                    mx: 'auto',
                    mb: 2,

                  }}
                >
                  {/* 👇 THAY BẰNG THẺ IMG */}
                <img 
                  src={logoImg} 
                  alt="Logo" 
                  style={{ width: '130%', height: '150%', objectFit: 'contain' }} 
                />
                </Avatar>

                <Typography 
                  variant="h4" 
                  fontWeight="800" 
                  sx={{ 
                    mb: 0.5,
                    background: 'linear-gradient(135deg, #1e3c72 0%, #6366f1 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  SafeToSchool
                </Typography>
                
                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                  <SecurityIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Hệ thống quản trị viên
                  </Typography>
                </Stack>
              </Box>
            </Fade>

            <Divider sx={{ mb: 3, opacity: 0.5 }} />

            {/* Error message */}
            <Fade in={!! error}>
              <Box>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      textAlign: 'left', 
                      borderRadius: 2,
                      animation: 'shake 0.5s ease-in-out',
                      '@keyframes shake': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '25%': { transform: 'translateX(-5px)' },
                        '75%': { transform: 'translateX(5px)' }
                      }
                    }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}
              </Box>
            </Fade>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Fade in={mounted} timeout={1200}>
                <TextField
                  fullWidth
                  label="Email hoặc Số điện thoại"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="admin@schoolbus.com"
                  autoComplete="username"
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#6366f1' }} />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      '&:hover': { bgcolor: '#f1f5f9' },
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&. Mui-focused': { 
                        bgcolor: 'white',
                        '& fieldset': { borderColor: '#6366f1', borderWidth: 2 }
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 500 }
                  }}
                />
              </Fade>

              <Fade in={mounted} timeout={1400}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  sx={{ mb: 3.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#6366f1' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setShowPassword(!showPassword)} 
                          edge="end"
                          sx={{ 
                            color: '#94a3b8',
                            '&:hover': { color: '#6366f1' }
                          }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: 2.5,
                      bgcolor: '#f8fafc',
                      '&:hover': { bgcolor: '#f1f5f9' },
                      '& fieldset': { borderColor: '#e2e8f0' },
                      '&. Mui-focused': { 
                        bgcolor: 'white',
                        '& fieldset': { borderColor: '#6366f1', borderWidth: 2 }
                      }
                    }
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 500 }
                  }}
                />
              </Fade>

              <Fade in={mounted} timeout={1600}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.8,
                    borderRadius: 2.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 10px 40px rgba(99, 102, 241, 0. 4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      boxShadow: '0 15px 50px rgba(99, 102, 241, 0.5)',
                      transform: 'translateY(-2px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)'
                    },
                    '&.Mui-disabled': {
                      background: '#e2e8f0',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                      <span>Đang đăng nhập...</span>
                    </Stack>
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>
              </Fade>
            </form>

            {/* Footer */}
            <Fade in={mounted} timeout={1800}>
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 2, opacity: 0.5 }} />
                <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                  <DirectionsBusIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                  <Typography variant="caption" color="text. secondary">
                    SafeToSchool © 2024
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text. secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Smart School Bus Management System
                </Typography>
              </Box>
            </Fade>
          </Paper>
        </Grow>

        {/* Version tag */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          v1.0.0
        </Typography>
      </Box>
    )
  }