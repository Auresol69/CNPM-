import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, IconButton, Avatar, Box, Menu, MenuItem,
  Badge, Stack, Tooltip, Divider, ListItemIcon
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

// Mapping path to title
const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/students': 'Quản lý Học sinh',
  '/admin/drivers': 'Quản lý Tài xế',
  '/admin/buses': 'Quản lý Xe buýt',
  '/admin/stations': 'Quản lý Trạm dừng',
  '/admin/routes': 'Quản lý Tuyến đường',
  '/admin/schedules': 'Quản lý Lịch trình',
  '/admin/trips': 'Quản lý Chuyến đi',
  '/admin/alerts': 'Cảnh báo',
  '/admin/messages': 'Tin nhắn'
}

export default function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Lấy title của trang hiện tại
  const currentPath = location.pathname
  const pageTitle = pageTitles[currentPath] ||
    Object.entries(pageTitles).find(([path]) => currentPath.startsWith(path))?.[1] ||
    'Admin Panel'

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    navigate('/admin/login', { replace: true })
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Page Title */}
        <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
          {pageTitle}
        </Typography>

        {/* Right side */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton sx={{ color: '#64748b' }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Box
            onClick={handleMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              py: 0.5,
              px: 1.5,
              borderRadius: 2,
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#6366f1',
                fontSize: '0.9rem'
              }}
            >
              {user.name?.charAt(0) || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600, lineHeight: 1.2 }}>
                {user.name || 'Admin'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {user.role || 'Administrator'}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user.name || 'Admin'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email || 'admin@safetoschool.com'}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Hồ sơ cá nhân
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Cài đặt
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}