import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  ButtonBase, 
  Stack,
  Paper
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';

// Import hình ảnh
import busImg from '../assets/bus.png';
import logoImg from '../assets/logo.png';

export default function TrangChu() {
  const navigate = useNavigate();

  const roles = [
    { name: 'Admin', icon: <AdminPanelSettingsIcon />, color: '#6366f1', path: '/admin/login' },
    { name: 'Parents', icon: <PersonOutlineIcon />, color: '#22c55e', path: '/parents/login' },
    { name: 'Driver', icon: <DirectionsBusIcon />, color: '#f59e0b', path: '/driver/login' }
  ];

  const handleRoleClick = (path) => {
    navigate(path);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f1f5f9',
        display: 'flex', 
        flexDirection: 'column',
        fontFamily: 'sans-serif' 
      }}
    >
      
      {/* HEADER */}
      <Box sx={{ bgcolor: '#6366f1', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box 
                sx={{ 
                  height: 60, width: 60,
                  bgcolor: '#f1f5f9',
                  borderRadius: 50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  boxShadow: 4 
                }}
              >
                <img 
                  src={logoImg} 
                  alt="Logo" 
                  style={{ width: '130%', height: '150%', objectFit: 'contain' }} 
                />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                Safe To School
              </Typography>
            </Stack>

            <Stack direction="row" spacing={4}>
              {['TRANG CHỦ', 'TÍNH NĂNG', 'LIÊN HỆ'].map((item) => (
                <Typography 
                  key={item} 
                  component="button"
                  sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 'bold', 
                    border: 'none',
                    bgcolor: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 } 
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>

          </Box>
        </Container>
      </Box>

      {/* NỘI DUNG CHÍNH */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 6 }}>
        <Container maxWidth="lg">
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 8,
              alignItems: 'center'
            }}
          >
            
            {/* === CỘT TRÁI === */}
            <Box sx={{ flex: 1, width: '100%' }}>
              
              <Typography 
                variant="h3" 
                fontWeight="bold" 
                sx={{ 
                  mb: 2,
                  lineHeight: 1.2, 
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                  color: '#6366f1'
                }}
              >
                Giữ con bạn an toàn<br />
                và luôn kết nối
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                    mb: 0,
                    color: '#475569', 
                    lineHeight: 1.6 
                }}
              >
                Theo dõi xe đưa đón học sinh theo thời gian thực, xem camera trực tiếp 
                và nhận thông báo tức thì giúp phụ huynh yên tâm và đảm bảo an toàn 
                cho con trên suốt hành trình đến trường.
              </Typography>

              {/* Hình xe bus*/}
              <Box 
                sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mt: -10,
                }}
              >
                <img 
                  src={busImg} 
                  alt="School Bus" 
                  style={{ 
                      width: '100%',
                      maxWidth: '650px',
                      height: 'auto',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0px 10px 20px rgba(99, 102, 241, 0.25))',
                      transform: 'scale(1.1)' 
                  }} 
                />
              </Box>
            </Box>

            {/* === CỘT PHẢI === */}
            <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
              
              <Paper 
                elevation={6}
                sx={{ 
                  p: 4,
                  borderRadius: 4,
                  width: '100%',
                  maxWidth: 400,
                  bgcolor: 'white'
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
                  Chào mừng trở lại
                </Typography>
                <Typography variant="body2" sx={{ mb: 4, color: '#64748b' }}>
                  Vui lòng chọn vai trò và đăng nhập
                </Typography>

                <Stack spacing={2}>
                  {roles.map((role) => (
                    <ButtonBase
                      key={role.name}
                      onClick={() => handleRoleClick(role.path)}
                      sx={{
                        width: '100%',
                        height: 56,
                        bgcolor: '#e0e7ff',
                        borderRadius: 2,
                        px: 3,
                        display: 'flex', 
                        justifyContent: 'flex-start', 
                        alignItems: 'center',
                        gap: 2,
                        fontSize: '1rem',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: '#c7d2fe',
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: role.color,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {role.icon}
                      </Box>
                      {role.name}
                    </ButtonBase>
                  ))}
                </Stack>

              </Paper>
            </Box>

          </Box>
        </Container>
      </Box>

    </Box>
  );
}