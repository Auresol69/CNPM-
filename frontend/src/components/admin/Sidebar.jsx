import React from 'react'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Stack, Divider, Chip } from '@mui/material'
import { NavLink, useLocation } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SchoolIcon from '@mui/icons-material/School'
import PeopleIcon from '@mui/icons-material/People'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PlaceIcon from '@mui/icons-material/Place'
import RouteIcon from '@mui/icons-material/Route'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DirectionsIcon from '@mui/icons-material/Directions'
import WarningIcon from '@mui/icons-material/Warning'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LogoutIcon from '@mui/icons-material/Logout'

const DRAWER_WIDTH = 280

const menuItems = [
  { to: '/admin/dashboard', icon: <DashboardIcon />, label: 'Dashboard', color: '#6366f1' },
  { to: '/admin/students', icon: <SchoolIcon />, label: 'Học sinh', color: '#22c55e' },
  { to: '/admin/drivers', icon: <PeopleIcon />, label: 'Tài xế', color: '#f59e0b' },
  { to: '/admin/buses', icon: <DirectionsBusIcon />, label: 'Xe buýt', color: '#ef4444' },
  { to: '/admin/stations', icon: <PlaceIcon />, label: 'Trạm dừng', color: '#8b5cf6' },
  { to: '/admin/routes', icon: <RouteIcon />, label: 'Tuyến đường', color: '#06b6d4' },
  { to: '/admin/schedules', icon: <CalendarMonthIcon />, label: 'Lịch trình', color: '#ec4899' },
  { to: '/admin/trips', icon: <DirectionsIcon />, label: 'Chuyến đi', color: '#14b8a6' },
  { to: '/admin/alerts', icon: <WarningIcon />, label: 'Cảnh báo', color: '#f97316' },
  { to: '/admin/messages', icon: <NotificationsIcon />, label: 'Thông báo', color: '#64748b' },
]

export default function Sidebar() {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    window.location.href = '/admin/login'
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          bgcolor: '#0f172a',
          color: 'white'
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
          <Avatar sx={{ bgcolor: '#6366f1', width: 45, height: 45 }}>
            <DirectionsBusIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', lineHeight: 1.2 }}>
              SafeToSchool
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Admin Panel
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: '#1e293b', mx: 2 }} />

      {/* Menu Items */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          
          return (
            <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.to}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  bgcolor: isActive ? `${item.color}20` : 'transparent',
                  '&:hover': { bgcolor: isActive ? `${item.color}30` : '#1e293b' },
                  transition: 'all 0.2s'
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? item.color : '#94a3b8', 
                  minWidth: 40,
                  '& svg': { fontSize: 22 }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                    color: isActive ? 'white' : '#cbd5e1'
                  }}
                />
                {isActive && (
                  <Box sx={{ 
                    width: 4, 
                    height: 20, 
                    bgcolor: item.color, 
                    borderRadius: 2,
                    ml: 1
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: '#1e293b', mx: 2 }} />

      {/* User Info & Logout */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2, p: 1.5, bgcolor: '#1e293b', borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
            {user.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'white' }}>
              {user.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {user.role || 'Administrator'}
            </Typography>
          </Box>
        </Stack>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.2,
            bgcolor: '#ef444420',
            '&:hover': { bgcolor: '#ef444430' }
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Đăng xuất"
            primaryTypographyProps={{ color: '#ef4444', fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  )
}