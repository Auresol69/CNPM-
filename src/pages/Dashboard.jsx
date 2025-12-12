import React, { useState, useEffect } from "react"
import { Grid, Paper, Typography, Box, Stack, Button, List, ListItem, ListItemIcon, ListItemText, Divider, LinearProgress, Avatar, Chip, CircularProgress } from "@mui/material"
import PeopleIcon from "@mui/icons-material/People"
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"
import PersonIcon from "@mui/icons-material/Person"
import RouteIcon from "@mui/icons-material/Route"
import PlaceIcon from "@mui/icons-material/Place"
import ScheduleIcon from "@mui/icons-material/Schedule"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import { useNavigate } from "react-router-dom"
import { AdminService } from "../api/services"

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

  const statCards = [
    { title: "Học sinh", value: stats.students, icon: <PeopleIcon />, color: "#22c55e", path: "/admin/students" },
    { title: "Tài xế", value: stats.drivers, icon: <PersonIcon />, color: "#6366f1", path: "/admin/drivers" },
    { title: "Xe buýt", value: stats.buses, icon: <DirectionsBusIcon />, color: "#f59e0b", path: "/admin/buses" },
    { title: "Tuyến đường", value: stats.routes, icon: <RouteIcon />, color: "#ef4444", path: "/admin/routes" },
    { title: "Trạm dừng", value: stats.stations, icon: <PlaceIcon />, color: "#8b5cf6", path: "/admin/stations" },
  ]

  const quickActions = [
    { label: "Thêm học sinh", path: "/admin/students", icon: <PeopleIcon /> },
    { label: "Thêm tài xế", path: "/admin/drivers", icon: <PersonIcon /> },
    { label: "Quản lý xe", path: "/admin/buses", icon: <DirectionsBusIcon /> },
    { label: "Xem cảnh báo", path: "/admin/alerts", icon: <WarningIcon /> },
    { label: "Theo dõi GPS", path: "/admin/tracking", icon: <DirectionsRunIcon /> },
  ]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Chào mừng trở lại!  Đây là tổng quan hệ thống hôm nay.
          </Typography>
        </Box>
        <Chip 
          icon={<ScheduleIcon />} 
          label={new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          sx={{ bgcolor: '#e0e7ff', color: '#6366f1', fontWeight: 500 }}
        />
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={2.4} key={stat.title}>
            <Paper
              elevation={0}
              onClick={() => navigate(stat.path)}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)',
                  borderColor: stat.color
                }
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: stat.color,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {stat.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748b',
                    whiteSpace: 'nowrap' // Dòng này giúp chữ luôn nằm trên 1 hàng
                  }}
                >
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

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
                    borderRadius: 2,
                    borderColor: '#e2e8f0',
                    color: '#475569',
                    '&:hover': {
                      bgcolor: '#6366f1',
                      color: 'white',
                      borderColor: '#6366f1',
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
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                🚍 Chuyến đi gần đây
              </Typography>
              <Button size="small" onClick={() => navigate('/admin/schedules')}>
                Xem tất cả
              </Button>
            </Stack>
            {trips.length > 0 ? (
              <Stack spacing={2}>
                {trips.map((trip, idx) => (
                  <Box key={trip._id || idx} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#6366f1', width: 36, height: 36 }}>
                          <DirectionsBusIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography fontWeight="600" sx={{ color: '#1e293b' }}>
                            {trip.route_name || trip.routeId?.name || `Chuyến #${idx + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {trip.bus_plate || trip.busId?.licensePlate || 'N/A'} • {trip.driver || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip 
                        size="small"
                        label={trip.status === 'COMPLETED' ? 'Hoàn thành' : trip.status === 'IN_PROGRESS' ? 'Đang chạy' : 'Chưa bắt đầu'}
                        color={trip.status === 'COMPLETED' ? 'success' : trip.status === 'IN_PROGRESS' ? 'primary' : 'default'}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Chưa có chuyến đi nào
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                ⚠️ Cảnh báo gần đây
              </Typography>
              <Button size="small" onClick={() => navigate('/admin/alerts')}>
                Xem tất cả
              </Button>
            </Stack>
            {alerts.length > 0 ? (
              <List sx={{ py: 0 }}>
                {alerts.map((alert, idx) => (
                  <React.Fragment key={alert._id || idx}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <WarningIcon sx={{ color: alert.type === 'SOS' ? '#ef4444' : '#f59e0b' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={alert.message}
                        secondary={`${alert.bus_plate || ''} • ${new Date(alert.createdAt || alert.timestamp).toLocaleString('vi-VN')}`}
                        primaryTypographyProps={{ fontWeight: 500, color: '#1e293b' }}
                        secondaryTypographyProps={{ color: '#64748b' }}
                      />
                      <Chip 
                        size="small" 
                        label={alert.type || 'INFO'} 
                        color={alert.type === 'SOS' ? 'error' : 'warning'}
                      />
                    </ListItem>
                    {idx < alerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Không có cảnh báo nào
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}