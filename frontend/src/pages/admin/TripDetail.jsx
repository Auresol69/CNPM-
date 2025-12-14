import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Stack, Button, Chip, CircularProgress,
  Avatar, List, ListItem, ListItemAvatar, ListItemText,
  IconButton, Alert, LinearProgress, Tooltip, Divider
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PersonIcon from '@mui/icons-material/Person'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PlaceIcon from '@mui/icons-material/Place'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SchoolIcon from '@mui/icons-material/School'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import RouteIcon from '@mui/icons-material/Route'
import SpeedIcon from '@mui/icons-material/Speed'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AdminService } from '../../services/admin/AdminService'
import { useNotify } from './hooks/useNotify'

// Fix icon Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icon cho trạm - lớn hơn
const createStationIcon = (color, number) => L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 15px;
      color: white;
      font-family: Arial, sans-serif;
    ">
      ${number}
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

// Component fit bounds
function FitBounds({ coordinates }) {
  const map = useMap()
  
  useEffect(() => {
    try {
      if (coordinates && Array.isArray(coordinates) && coordinates.length > 0) {
        const validBounds = coordinates
          .filter(coord => Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]))
          .map(coord => [coord[1], coord[0]])
        
        if (validBounds.length > 0) {
          map.fitBounds(validBounds, { padding: [60, 60] })
        }
      }
    } catch (e) {
      console.error('Error fitting bounds:', e)
    }
  }, [coordinates, map])
  
  return null
}

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useNotify()

  const [loading, setLoading] = useState(true)
  const [tripData, setTripData] = useState(null)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    if (!id) {
      setError('ID chuyến đi không hợp lệ')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await AdminService.getTrip(id)
      console.log('Trip data:', response)
      
      if (!response) {
        throw new Error('Không nhận được dữ liệu từ server')
      }
      
      setTripData(response)
    } catch (err) {
      console.error('Error fetching trip:', err)
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || err.message || 'Không thể tải thông tin chuyến đi'
      setError(errorMessage)
      notify.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  // Status config
  const getStatusConfig = (status) => {
    const configs = {
      'NOT_STARTED': { 
        label: 'Chưa bắt đầu', 
        color: '#64748b',
        bgcolor: '#f1f5f9',
        icon: <ScheduleIcon />
      },
      'IN_PROGRESS': { 
        label: 'Đang chạy', 
        color: '#1d4ed8',
        bgcolor: '#dbeafe',
        icon: <PlayArrowIcon />
      },
      'COMPLETED': { 
        label: 'Hoàn thành', 
        color: '#166534',
        bgcolor: '#dcfce7',
        icon: <CheckCircleIcon />
      },
      'CANCELLED': { 
        label: 'Đã hủy', 
        color: '#dc2626',
        bgcolor: '#fee2e2',
        icon: <CancelIcon />
      }
    }
    return configs[status] || configs['NOT_STARTED']
  }

  // Student status
  const getStudentStatusConfig = (action) => {
    const configs = {
      'PENDING': { 
        label: 'Chờ đón', 
        color: '#64748b', 
        bgcolor: '#f1f5f9',
        icon: <ScheduleIcon />
      },
      'PICKED_UP': { 
        label: 'Đã lên xe', 
        color: '#166534', 
        bgcolor: '#dcfce7',
        icon: <CheckCircleIcon />
      },
      'DROPPED_OFF': { 
        label: 'Đã xuống xe', 
        color: '#1d4ed8', 
        bgcolor: '#dbeafe',
        icon: <CheckCircleIcon />
      },
      'ABSENT': { 
        label: 'Vắng mặt', 
        color: '#dc2626', 
        bgcolor: '#fee2e2',
        icon: <CancelIcon />
      }
    }
    return configs[action] || configs['PENDING']
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={70} sx={{ color: '#6366f1' }} />
        <Typography sx={{ mt: 3, color: '#64748b', fontSize: '1.1rem' }}>Đang tải thông tin chuyến đi...</Typography>
      </Box>
    )
  }

  // Error state
  if (error || !tripData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3, fontSize: '1rem' }}>
          {error || 'Không tìm thấy thông tin chuyến đi'}
        </Alert>
        <Stack direction="row" spacing={2}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/admin/trips')} 
            variant="outlined"
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Quay lại danh sách
          </Button>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchData} 
            variant="contained"
            size="large"
            sx={{ borderRadius: 2 }}
          >
            Thử lại
          </Button>
        </Stack>
      </Box>
    )
  }

  // Safe data extraction
  const statusConfig = getStatusConfig(tripData.status)
  const routeData = tripData.routeId || {}
  const orderedStops = routeData.orderedStops || []
  const routeShape = routeData.shape?.coordinates || []
  
  const polylinePositions = routeShape
    .filter(coord => Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]))
    .map(coord => [coord[1], coord[0]])
  
  const studentStops = tripData.studentStops || []
  const totalStudents = studentStops.length
  const pickedUp = studentStops.filter(s => s?.action === 'PICKED_UP' || s?.action === 'DROPPED_OFF').length
  const absent = studentStops.filter(s => s?.action === 'ABSENT').length
  const pending = studentStops.filter(s => !s?.action || s?.action === 'PENDING').length
  const progressPercent = totalStudents > 0 ? Math.round((pickedUp / totalStudents) * 100) : 0

  const formatTripDate = () => {
    try {
      if (!tripData.tripDate) return '—'
      return new Date(tripData.tripDate).toLocaleDateString('vi-VN', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    } catch {
      return '—'
    }
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header - Compact */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton 
              onClick={() => navigate('/admin/trips')}
              sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e293b' }}>
                  🚌 {routeData.name || 'Chi tiết chuyến đi'}
                </Typography>
                <Chip
                  icon={tripData.direction === 'PICK_UP' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  label={tripData.direction === 'PICK_UP' ? 'Đón học sinh' : 'Trả học sinh'}
                  size="small"
                  sx={{
                    bgcolor: tripData.direction === 'PICK_UP' ? '#dcfce7' : '#dbeafe',
                    color: tripData.direction === 'PICK_UP' ? '#166534' : '#1d4ed8',
                    fontWeight: 600
                  }}
                />
                <Chip
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  sx={{
                    bgcolor: statusConfig.bgcolor,
                    color: statusConfig.color,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: statusConfig.color }
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  icon={<AccessTimeIcon />}
                  label={formatTripDate()}
                  sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}
                />
                <Chip
                  size="small"
                  icon={<PlaceIcon />}
                  label={`${orderedStops.length} trạm`}
                  sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}
                />
                <Chip
                  size="small"
                  icon={<SchoolIcon />}
                  label={`${totalStudents} học sinh`}
                  sx={{ bgcolor: '#fef3c7', color: '#92400e' }}
                />
              </Stack>
            </Box>
          </Stack>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchData} 
            variant="outlined" 
            sx={{ borderRadius: 2 }}
          >
            Làm mới
          </Button>
        </Stack>
      </Paper>

      {/* Main Content - Full Height */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        {/* Left - Map (Larger) */}
        <Paper sx={{ 
          flex: 2, 
          borderRadius: 3, 
          overflow: 'hidden', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Map */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <MapContainer
              center={[10.7769, 106.7009]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {routeShape.length > 0 && (
                <FitBounds coordinates={routeShape} />
              )}

              {/* Vẽ tuyến đường */}
              {polylinePositions.length > 0 && (
                <Polyline
                  positions={polylinePositions}
                  pathOptions={{ 
                    color: '#6366f1', 
                    weight: 6, 
                    opacity: 0.85,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )}

              {/* Vẽ các trạm */}
              {orderedStops.map((station, index) => {
                const coords = station?.address?.location?.coordinates || []
                const lng = coords[0]
                const lat = coords[1]
                
                if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null
                
                const isFirst = index === 0
                const isLast = index === orderedStops.length - 1
                const color = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#6366f1'
                
                return (
                  <Marker
                    key={station?._id || `station-${index}`}
                    position={[lat, lng]}
                    icon={createStationIcon(color, index + 1)}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 220, p: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: 14 }}>
                            {index + 1}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {station?.name || 'Trạm'}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          📍 {station?.address?.fullAddress || ''}
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>

            {/* Chú thích trên map */}
            <Paper sx={{ 
              position: 'absolute', 
              bottom: 20, 
              left: 20, 
              p: 2, 
              borderRadius: 2, 
              zIndex: 1000,
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}>
              <Typography variant="caption" fontWeight="bold" sx={{ mb: 1.5, display: 'block', color: '#374151' }}>
                📌 Chú thích
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 2px 4px rgba(34,197,94,0.4)' }} />
                  <Typography variant="caption">Trạm xuất phát</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#6366f1', boxShadow: '0 2px 4px rgba(99,102,241,0.4)' }} />
                  <Typography variant="caption">Trạm trung gian</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#ef4444', boxShadow: '0 2px 4px rgba(239,68,68,0.4)' }} />
                  <Typography variant="caption">Trạm đích (Trường)</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>

          {/* Info Cards - Bottom of Map */}
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Stack direction="row" spacing={2} justifyContent="space-around">
              <Stack alignItems="center" spacing={0.5}>
                <DirectionsBusIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                <Typography variant="caption" color="text.secondary">Biển số</Typography>
                <Typography variant="body1" fontWeight="bold">{tripData.busId?.licensePlate || '—'}</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack alignItems="center" spacing={0.5}>
                <PersonIcon sx={{ fontSize: 32, color: '#6366f1' }} />
                <Typography variant="caption" color="text.secondary">Tài xế</Typography>
                <Typography variant="body1" fontWeight="bold">{tripData.driverId?.name || '—'}</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack alignItems="center" spacing={0.5}>
                <RouteIcon sx={{ fontSize: 32, color: '#8b5cf6' }} />
                <Typography variant="caption" color="text.secondary">Khoảng cách</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {routeData.distanceMeters ? `${(routeData.distanceMeters / 1000).toFixed(1)} km` : '—'}
                </Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack alignItems="center" spacing={0.5}>
                <AccessTimeIcon sx={{ fontSize: 32, color: '#22c55e' }} />
                <Typography variant="caption" color="text.secondary">Bắt đầu</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {tripData.actualStartTime 
                    ? new Date(tripData.actualStartTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '—'
                  }
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {/* Right - Student Panel */}
        <Paper sx={{ 
          width: 380, 
          borderRadius: 3, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {/* Progress Header */}
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
            color: 'white' 
          }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
              📊 Tiến độ đưa đón
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h2" fontWeight="bold">{progressPercent}%</Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercent} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white', borderRadius: 6 }
                  }}
                />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {pickedUp}/{totalStudents} học sinh
                  </Typography>
                  {absent > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {absent} vắng
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Stats */}
          <Stack direction="row" sx={{ borderBottom: '1px solid #e2e8f0' }}>
            <Box sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#dcfce7' }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#166534' }}>{pickedUp}</Typography>
              <Typography variant="caption" sx={{ color: '#166534' }}>Đã đón/trả</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#fef3c7' }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#92400e' }}>{pending}</Typography>
              <Typography variant="caption" sx={{ color: '#92400e' }}>Chờ đón</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#fee2e2' }}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#dc2626' }}>{absent}</Typography>
              <Typography variant="caption" sx={{ color: '#dc2626' }}>Vắng mặt</Typography>
            </Box>
          </Stack>

          {/* Student List Header */}
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SchoolIcon sx={{ color: '#6366f1' }} />
              <Typography variant="subtitle1" fontWeight="600">
                Danh sách học sinh ({totalStudents})
              </Typography>
            </Stack>
          </Box>

          {/* Student List */}
          <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {studentStops.length > 0 ? (
              studentStops.map((ss, index) => {
                const statusCfg = getStudentStatusConfig(ss?.action)
                const studentName = ss?.studentId?.name || `Học sinh ${index + 1}`
                const stationName = ss?.stationId?.name || ''
                
                return (
                  <ListItem 
                    key={ss?.studentId?._id || `student-${index}`}
                    sx={{ 
                      borderRadius: 2, 
                      mb: 1,
                      bgcolor: statusCfg.bgcolor,
                      border: `1px solid ${statusCfg.color}30`
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: statusCfg.color, width: 44, height: 44 }}>
                        {statusCfg.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>{studentName}</Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Chip 
                            label={statusCfg.label} 
                            size="small" 
                            sx={{ 
                              height: 22, 
                              fontSize: '0.75rem',
                              bgcolor: 'white',
                              color: statusCfg.color,
                              fontWeight: 600
                            }} 
                          />
                          {ss?.timestamp && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(ss.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                    {stationName && (
                      <Tooltip title={`Trạm: ${stationName}`}>
                        <PlaceIcon sx={{ color: '#94a3b8', fontSize: 22 }} />
                      </Tooltip>
                    )}
                  </ListItem>
                )
              })
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <HelpOutlineIcon sx={{ fontSize: 56, color: '#e2e8f0', mb: 2 }} />
                <Typography color="text.secondary" variant="body1">Chưa có học sinh trong chuyến</Typography>
              </Box>
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  )
}