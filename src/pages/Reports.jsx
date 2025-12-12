import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PersonIcon from '@mui/icons-material/Person'
import RouteIcon from '@mui/icons-material/Route'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ScheduleIcon from '@mui/icons-material/Schedule'
import DownloadIcon from '@mui/icons-material/Download'
import PrintIcon from '@mui/icons-material/Print'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import avatarTrai from '../assets/avatar_trai.png'
import avatarGai from '../assets/avatar_gai.png'
import avatarDriver from '../assets/driver.png'

// Dữ liệu mẫu - Thống kê tổng quan
const overviewStats = [
  { title: 'Tổng học sinh', value: 150, icon: <PeopleIcon />, color: '#22c55e', change: '+12', trend: 'up' },
  { title: 'Tổng tài xế', value: 12, icon: <PersonIcon />, color: '#6366f1', change: '+2', trend: 'up' },
  { title: 'Tổng xe buýt', value: 8, icon: <DirectionsBusIcon />, color: '#f59e0b', change: '0', trend: 'neutral' },
  { title: 'Tổng tuyến đường', value: 5, icon: <RouteIcon />, color: '#ef4444', change: '+1', trend: 'up' },
]

// Dữ liệu mẫu - Thống kê điểm danh tuần này
const attendanceData = [
  { day: 'Thứ 2', present: 145, absent: 5, rate: 96.7 },
  { day: 'Thứ 3', present: 142, absent: 8, rate: 94.7 },
  { day: 'Thứ 4', present: 148, absent: 2, rate: 98.7 },
  { day: 'Thứ 5', present: 140, absent: 10, rate: 93.3 },
  { day: 'Thứ 6', present: 147, absent: 3, rate: 98.0 },
]

// Dữ liệu mẫu - Hiệu suất tài xế
const driverPerformance = [
  { name: 'Nguyễn Văn A', trips: 45, onTime: 43, rating: 4.8, status: 'excellent' },
  { name: 'Trần Văn B', trips: 42, onTime: 40, rating: 4.5, status: 'good' },
  { name: 'Lê Văn C', trips: 38, onTime: 35, rating: 4.2, status: 'good' },
  { name: 'Phạm Văn D', trips: 40, onTime: 32, rating: 3.8, status: 'average' },
  { name: 'Hoàng Văn E', trips: 35, onTime: 33, rating: 4.6, status: 'good' },
]

// Dữ liệu mẫu - Tình trạng xe
const busStatus = [
  { plate: '51B-12345', model: 'Toyota Hiace', status: 'active', trips: 120, lastMaintenance: '15/11/2025' },
  { plate: '51B-67890', model: 'Ford Transit', status: 'active', trips: 98, lastMaintenance: '10/11/2025' },
  { plate: '51B-11111', model: 'Mercedes Sprinter', status: 'maintenance', trips: 85, lastMaintenance: '28/11/2025' },
  { plate: '51B-22222', model: 'Toyota Hiace', status: 'active', trips: 110, lastMaintenance: '20/11/2025' },
  { plate: '51B-33333', model: 'Ford Transit', status: 'inactive', trips: 45, lastMaintenance: '01/10/2025' },
]

// Dữ liệu mẫu - Thống kê theo tuyến
const routeStats = [
  { name: 'Tuyến A - Quận 1', students: 35, stops: 8, avgTime: '45 phút', efficiency: 92 },
  { name: 'Tuyến B - Quận 3', students: 28, stops: 6, avgTime: '35 phút', efficiency: 88 },
  { name: 'Tuyến C - Quận 7', students: 42, stops: 10, avgTime: '55 phút', efficiency: 85 },
  { name: 'Tuyến D - Quận 9', students: 25, stops: 7, avgTime: '40 phút', efficiency: 90 },
  { name: 'Tuyến E - Thủ Đức', students: 20, stops: 5, avgTime: '30 phút', efficiency: 95 },
]

export default function Reports() {
  const [timeRange, setTimeRange] = useState('week')

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Báo cáo thống kê
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Xem tổng quan và phân tích dữ liệu hệ thống
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Thời gian</InputLabel>
            <Select
              value={timeRange}
              label="Thời gian"
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="week">Tuần này</MenuItem>
              <MenuItem value="month">Tháng này</MenuItem>
              <MenuItem value="quarter">Quý này</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            sx={{ borderRadius: 2, borderColor: '#e2e8f0', color: '#475569' }}
          >
            In báo cáo
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 2, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
          >
            Xuất Excel
          </Button>
        </Stack>
      </Stack>

      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {overviewStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
                    {stat.value}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                    {stat.trend === 'up' && <TrendingUpIcon sx={{ fontSize: 16, color: '#22c55e' }} />}
                    {stat.trend === 'down' && <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />}
                    <Typography variant="caption" sx={{ color: stat.trend === 'up' ? '#22c55e' : stat.trend === 'down' ? '#ef4444' : '#64748b' }}>
                      {stat.change} so với tháng trước
                    </Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: stat.color,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  {stat.icon}
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Bảng điểm danh tuần */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                📊 Thống kê điểm danh tuần này
              </Typography>
              <Chip 
                icon={<CalendarMonthIcon sx={{ fontSize: 16 }} />} 
                label="25/11 - 29/11" 
                size="small"
                sx={{ bgcolor: '#e0e7ff', color: '#6366f1' }}
              />
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Có mặt</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Vắng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Tỷ lệ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map((row) => (
                    <TableRow key={row.day} hover>
                      <TableCell>{row.day}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                          label={row.present} 
                          size="small" 
                          sx={{ bgcolor: '#dcfce7', color: '#22c55e' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          icon={<CancelIcon sx={{ fontSize: 14 }} />}
                          label={row.absent} 
                          size="small" 
                          sx={{ bgcolor: '#fee2e2', color: '#ef4444' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={row.rate}
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#e2e8f0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: row.rate >= 95 ? '#22c55e' : row.rate >= 90 ? '#f59e0b' : '#ef4444',
                                borderRadius: 3
                              }
                            }}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {row.rate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Hiệu suất tài xế */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 2 }}>
              🚗 Hiệu suất tài xế
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Tài xế</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Chuyến</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Đúng giờ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Đánh giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {driverPerformance.map((driver) => (
                    <TableRow key={driver.name} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={avatarDriver} sx={{ width: 32, height: 32 }} />
                          <Typography variant="body2" fontWeight={500}>{driver.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">{driver.trips}</TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: (driver.onTime / driver.trips) >= 0.95 ? '#22c55e' : '#f59e0b',
                            fontWeight: 500
                          }}
                        >
                          {driver.onTime}/{driver.trips}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`⭐ ${driver.rating}`}
                          size="small"
                          sx={{
                            bgcolor: driver.status === 'excellent' ? '#dcfce7' : driver.status === 'good' ? '#e0e7ff' : '#fef3c7',
                            color: driver.status === 'excellent' ? '#22c55e' : driver.status === 'good' ?  '#6366f1' : '#f59e0b',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Tình trạng xe */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 2 }}>
              🚌 Tình trạng xe buýt
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Biển số</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Bảo trì</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {busStatus.map((bus) => (
                    <TableRow key={bus.plate} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{bus.plate}</Typography>
                      </TableCell>
                      <TableCell>{bus.model}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={
                            bus.status === 'active' ? 'Hoạt động' :
                            bus.status === 'maintenance' ? 'Bảo trì' : 'Ngừng'
                          }
                          sx={{
                            bgcolor: bus.status === 'active' ? '#dcfce7' : bus.status === 'maintenance' ? '#fef3c7' : '#fee2e2',
                            color: bus.status === 'active' ? '#22c55e' : bus.status === 'maintenance' ? '#f59e0b' : '#ef4444',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {bus.lastMaintenance}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Thống kê tuyến đường */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', mb: 2 }}>
              🛣️ Thống kê tuyến đường
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Tuyến</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Học sinh</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Điểm dừng</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Hiệu suất</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {routeStats.map((route) => (
                    <TableRow key={route.name} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{route.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          ~{route.avgTime}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Avatar src={avatarTrai} sx={{ width: 20, height: 20 }} />
                          <Typography variant="body2">{route.students}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">{route.stops}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={route.efficiency}
                            sx={{
                              width: 50,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: '#e2e8f0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: route.efficiency >= 90 ? '#22c55e' : route.efficiency >= 80 ? '#f59e0b' : '#ef4444',
                                borderRadius: 3
                              }
                            }}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {route.efficiency}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}