import React, { useState, useEffect } from "react"
import { 
  Grid, Paper, Typography, Box, Stack, Button, List, ListItem, 
  ListItemIcon, ListItemText, Divider, Avatar, Chip, CircularProgress
} from "@mui/material"
import PeopleIcon from "@mui/icons-material/People"
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"
import PersonIcon from "@mui/icons-material/Person"
import RouteIcon from "@mui/icons-material/Route"
import PlaceIcon from "@mui/icons-material/Place"
import ScheduleIcon from "@mui/icons-material/Schedule"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { useNavigate } from "react-router-dom"
import { AdminService } from "../../services/admin/AdminService"

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    students: 0,
    drivers: 0,
    buses: 0,
    routes: 0,
    stations: 0
  })
  const [alerts, setAlerts] = useState([])
  const [trips, setTrips] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [students, drivers, buses, routes, stations, alertsData, tripsData] = await Promise.all([
          AdminService.listStudents(),
          AdminService.listDrivers(),
          AdminService.listBuses(),
          AdminService.listRoutes(),
          AdminService.listStations(),
          AdminService.listAlerts().catch(() => []),
          AdminService.listTrips().catch(() => [])
        ])

        setStats({
          students: students.length,
          drivers: drivers.length,
          buses: buses.length,
          routes: routes.length,
          stations: stations.length
        })
        setAlerts(alertsData.slice(0, 5))
        setTrips(tripsData.slice(0, 5))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Thống kê chuyến đi
  const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS').length
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length

  const statCards = [
    { title: "Học sinh", value: stats.students, icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: "#22c55e", bgcolor: "#dcfce7", path: "/admin/students" },
    { title: "Tài xế", value: stats.drivers, icon: <PersonIcon sx={{ fontSize: 32 }} />, color: "#6366f1", bgcolor: "#e0e7ff", path: "/admin/drivers" },
    { title: "Xe buýt", value: stats.buses, icon: <DirectionsBusIcon sx={{ fontSize: 32 }} />, color: "#f59e0b", bgcolor: "#fef3c7", path: "/admin/buses" },
    { title: "Tuyến đường", value: stats.routes, icon: <RouteIcon sx={{ fontSize: 32 }} />, color: "#ef4444", bgcolor: "#fee2e2", path: "/admin/routes" },
    { title: "Trạm dừng", value: stats.stations, icon: <PlaceIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", bgcolor: "#f3e8ff", path: "/admin/stations" },
  ]

  const quickActions = [
    { label: "Thêm học sinh", path: "/admin/students", icon: <PeopleIcon />, color: "#22c55e" },
    { label: "Thêm tài xế", path: "/admin/drivers", icon: <PersonIcon />, color: "#6366f1" },
    { label: "Quản lý xe", path: "/admin/buses", icon: <DirectionsBusIcon />, color: "#f59e0b" },
    { label: "Xem cảnh báo", path: "/admin/alerts", icon: <WarningIcon />, color: "#ef4444" },
    { label: "Theo dõi GPS", path: "/admin/tracking", icon: <DirectionsRunIcon />, color: "#8b5cf6" },
  ]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={70} sx={{ color: '#6366f1' }} />
        <Typography sx={{ mt: 2, color: '#64748b', fontSize: '1.1rem' }}>Đang tải dữ liệu...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 4, 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              👋 Chào mừng trở lại!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              Tổng quan hệ thống xe buýt trường học
            </Typography>
          </Box>
          <Chip 
            icon={<ScheduleIcon />} 
            label={new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, py: 2, '& .MuiChip-icon': { color: 'white' } }}
          />
        </Stack>

        {/* Mini Stats trong Header */}
        <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 3, py: 1.5, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">{trips.length}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Chuyến đi</Typography>
          </Box>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 3, py: 1.5, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">{activeTrips}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Đang chạy</Typography>
          </Box>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 3, py: 1.5, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">{completedTrips}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Hoàn thành</Typography>
          </Box>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 3, py: 1.5, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">{alerts.length}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Cảnh báo</Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid item xs={6} sm={4} md={2.4} key={stat.title}>
            <Paper
              elevation={0}
              onClick={() => navigate(stat.path)}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)',
                  borderColor: stat.color
                }
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{
                  width: 60,
                  height: 60,
                  bgcolor: stat.bgcolor,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {stat.title}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content: Quick Actions + Trips + Alerts cùng hàng */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
              ⚡ Thao tác nhanh
            </Typography>
            <Stack spacing={1.5}>
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={() => navigate(action.path)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    borderColor: '#e2e8f0',
                    color: '#475569',
                    fontSize: '0.95rem',
                    '&:hover': {
                      bgcolor: action.color,
                      color: 'white',
                      borderColor: action.color,
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Trips */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                🚍 Chuyến đi gần đây
              </Typography>
              <Button size="small" onClick={() => navigate('/admin/trips')}>
                Xem tất cả
              </Button>
            </Stack>
            {trips.length > 0 ? (
              <Stack spacing={1.5}>
                {trips.map((trip, idx) => (
                  <Paper 
                    key={trip._id || idx} 
                    elevation={0}
                    onClick={() => navigate(`/admin/trips/${trip._id}`)}
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f8fafc', 
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#f1f5f9', transform: 'translateX(4px)' }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ 
                        bgcolor: trip.status === 'IN_PROGRESS' ? '#dbeafe' : trip.status === 'COMPLETED' ? '#dcfce7' : '#f1f5f9',
                        color: trip.status === 'IN_PROGRESS' ? '#1d4ed8' : trip.status === 'COMPLETED' ? '#166534' : '#64748b',
                        width: 40, 
                        height: 40 
                      }}>
                        {trip.status === 'IN_PROGRESS' ? <PlayArrowIcon fontSize="small" /> : 
                         trip.status === 'COMPLETED' ? <CheckCircleIcon fontSize="small" /> : <AccessTimeIcon fontSize="small" />}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }} noWrap>
                          {trip.route_name || trip.routeId?.name || `Chuyến #${idx + 1}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                          🚌 {trip.bus_plate || trip.busId?.licensePlate || 'N/A'}
                        </Typography>
                      </Box>
                      <Chip 
                        size="small"
                        label={trip.status === 'COMPLETED' ? 'Xong' : trip.status === 'IN_PROGRESS' ? 'Chạy' : 'Chờ'}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          bgcolor: trip.status === 'COMPLETED' ? '#dcfce7' : trip.status === 'IN_PROGRESS' ? '#dbeafe' : '#f1f5f9',
                          color: trip.status === 'COMPLETED' ? '#166534' : trip.status === 'IN_PROGRESS' ? '#1d4ed8' : '#64748b'
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <DirectionsBusIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                <Typography color="text.secondary">Chưa có chuyến đi nào</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                ⚠️ Cảnh báo gần đây
              </Typography>
              <Button size="small" onClick={() => navigate('/admin/alerts')}>
                Xem tất cả
              </Button>
            </Stack>
            {alerts.length > 0 ? (
              <Stack spacing={1.5}>
                {alerts.map((alert, idx) => (
                  <Paper
                    key={alert._id || idx}
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: alert.type === 'SOS' ? '#fef2f2' : '#fffbeb'
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ 
                        bgcolor: alert.type === 'SOS' ? '#fee2e2' : '#fef3c7',
                        width: 40,
                        height: 40
                      }}>
                        <WarningIcon sx={{ color: alert.type === 'SOS' ? '#ef4444' : '#f59e0b', fontSize: 20 }} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }} noWrap>
                          {alert.message || 'Cảnh báo hệ thống'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {new Date(alert.createdAt || alert.timestamp).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                      <Chip 
                        size="small" 
                        label={alert.type || 'INFO'} 
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          bgcolor: alert.type === 'SOS' ? '#ef4444' : '#f59e0b',
                          color: 'white'
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#22c55e', mb: 1 }} />
                <Typography color="text.secondary">Không có cảnh báo</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
