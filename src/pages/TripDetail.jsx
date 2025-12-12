import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Stack, Button, Chip, CircularProgress,
  Grid, Avatar, List, ListItem, ListItemAvatar, ListItemText,
  IconButton, Alert, Card, CardContent, LinearProgress, Tooltip
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
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AdminService } from '../api/services'
import { useNotify } from '../hooks/useNotify'

// Fix icon Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x. png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon. png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow. png',
})

// Custom icon cho trạm
const createStationIcon = (color, number) => L.divIcon({
  className: 'custom-marker',
  html:  `
    <div style="
      background:  ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      color: white;
    ">
      ${number}
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

// Component fit bounds
function FitBounds({ coordinates }) {
  const map = useMap()
  
  useEffect(() => {
    try {
      if (coordinates && Array.isArray(coordinates) && coordinates.length > 0) {
        const validBounds = coordinates
          .filter(coord => Array.isArray(coord) && coord.length >= 2 && ! isNaN(coord[0]) && !isNaN(coord[1]))
          .map(coord => [coord[1], coord[0]])
        
        if (validBounds.length > 0) {
          map.fitBounds(validBounds, { padding: [50, 50] })
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
      
      if (! response) {
        throw new Error('Không nhận được dữ liệu từ server')
      }
      
      setTripData(response)
    } catch (err) {
      console. error('Error fetching trip:', err)
      const errorMessage = err. response?.data?.msg || err.response?.data?.message || err.message || 'Không thể tải thông tin chuyến đi'
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
        color:  '#64748b',
        bgcolor: '#f1f5f9',
        icon: <ScheduleIcon />
      },
      'IN_PROGRESS': { 
        label:  'Đang chạy', 
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
        color:  '#dc2626',
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
        bgcolor:  '#f1f5f9',
        icon: <ScheduleIcon />
      },
      'PICKED_UP': { 
        label: 'Đã lên xe', 
        color: '#166534', 
        bgcolor: '#dcfce7',
        icon: <CheckCircleIcon />
      },
      'DROPPED_OFF':  { 
        label: 'Đã xuống xe', 
        color: '#1d4ed8', 
        bgcolor:  '#dbeafe',
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
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems:  'center', height: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
        <Typography sx={{ mt: 2, color: '#64748b' }}>Đang tải thông tin chuyến đi...</Typography>
      </Box>
    )
  }

  // Error state
  if (error || !tripData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          {error || 'Không tìm thấy thông tin chuyến đi'}
        </Alert>
        <Stack direction="row" spacing={2}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/admin/trips')} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Quay lại danh sách
          </Button>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={fetchData} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Thử lại
          </Button>
        </Stack>
      </Box>
    )
  }

  // Safe data extraction - Backend structure
  const statusConfig = getStatusConfig(tripData.status)
  const routeData = tripData.routeId || {}
  const orderedStops = routeData. orderedStops || []
  
  // Backend:  shape. coordinates = [[lng, lat], [lng, lat], ...]
  const routeShape = routeData.shape?. coordinates || []
  
  // Build polyline positions safely - convert [lng, lat] to [lat, lng] for Leaflet
  const polylinePositions = routeShape
    .filter(coord => Array. isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]))
    .map(coord => [coord[1], coord[0]]) // Leaflet uses [lat, lng]
  
  // Calculate stats safely - Backend:  studentStops array
  const studentStops = tripData. studentStops || []
  const totalStudents = studentStops.length
  const pickedUp = studentStops. filter(s => s?. action === 'PICKED_UP' || s?.action === 'DROPPED_OFF').length
  const absent = studentStops. filter(s => s?.action === 'ABSENT').length
  const pending = studentStops. filter(s => ! s?.action || s?.action === 'PENDING').length
  const progressPercent = totalStudents > 0 ? Math.round((pickedUp / totalStudents) * 100) : 0

  // Format date safely
  const formatTripDate = () => {
    try {
      if (!tripData. tripDate) return '—'
      return new Date(tripData.tripDate).toLocaleDateString('vi-VN', {
        weekday: 'long', 
        year:  'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    } catch {
      return '—'
    }
  }

  return (
    <Box>
      {/* Header */}
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
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h6" fontWeight="bold">
                  {routeData.name || 'Chi tiết chuyến đi'}
                </Typography>
                <Chip
                  icon={tripData.direction === 'PICK_UP' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  label={tripData.direction === 'PICK_UP' ? 'Đón học sinh' : 'Trả học sinh'}
                  size="small"
                  sx={{
                    bgcolor: tripData.direction === 'PICK_UP' ? '#dcfce7' :  '#dbeafe',
                    color: tripData.direction === 'PICK_UP' ? '#166534' : '#1d4ed8'
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                📅 {formatTripDate()}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              sx={{
                bgcolor:  statusConfig.bgcolor,
                color: statusConfig.color,
                fontWeight: 600,
                fontSize: '0.9rem',
                py: 2,
                '& .MuiChip-icon': { color: statusConfig.color }
              }}
            />
            <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="outlined" sx={{ borderRadius: 2 }}>
              Làm mới
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {/* Cột trái - Bản đồ */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ height: 500, borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
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
                  pathOptions={{ color: '#6366f1', weight: 5, opacity: 0.8 }}
                />
              )}

              {/* Vẽ các trạm */}
              {orderedStops.map((station, index) => {
                // Backend: station.address. location. coordinates = [lng, lat]
                const coords = station?. address?.location?.coordinates || []
                const lng = coords[0]
                const lat = coords[1]
                
                if (! lat || !lng || isNaN(lat) || isNaN(lng)) return null
                
                const isFirst = index === 0
                const isLast = index === orderedStops.length - 1
                const color = isFirst ? '#22c55e' :  isLast ? '#ef4444' : '#6366f1'
                
                return (
                  <Marker
                    key={station?._id || `station-${index}`}
                    position={[lat, lng]}
                    icon={createStationIcon(color, index + 1)}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 180 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {index + 1}.  {station?. name || 'Trạm'}
                        </Typography>
                        <Typography variant="caption" color="text. secondary">
                          {station?.address?. fullAddress || ''}
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </Paper>

          {/* Thông tin chuyến */}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: 2, bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <DirectionsBusIcon sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
                  <Typography variant="caption" color="text. secondary" display="block">Biển số xe</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {tripData.busId?. licensePlate || '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius:  2, bgcolor:  '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <PersonIcon sx={{ fontSize: 32, color: '#6366f1', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Tài xế</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {tripData. driverId?.name || '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: 2, bgcolor: '#f8fafc', boxShadow: 'none', border:  '1px solid #e2e8f0' }}>
                <CardContent sx={{ textAlign: 'center', py:  2 }}>
                  <PlaceIcon sx={{ fontSize: 32, color: '#8b5cf6', mb: 1 }} />
                  <Typography variant="caption" color="text. secondary" display="block">Số trạm</Typography>
                  <Typography variant="body1" fontWeight="bold">{orderedStops.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ borderRadius: 2, bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <AccessTimeIcon sx={{ fontSize: 32, color: '#22c55e', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Bắt đầu</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {tripData.actualStartTime 
                      ? new Date(tripData. actualStartTime).toLocaleTimeString('vi-VN', { hour:  '2-digit', minute: '2-digit' })
                      : '—'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Cột phải - Trạng thái học sinh */}
        <Grid item xs={12} lg={5}>
          {/* Progress Card */}
          <Paper sx={{ p: 2.5, mb: 2, borderRadius: 3, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
              Tiến độ đưa đón
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h3" fontWeight="bold">{progressPercent}%</Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercent} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar':  { bgcolor: 'white', borderRadius: 5 }
                  }}
                />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {pickedUp}/{totalStudents} học sinh
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {absent > 0 && `${absent} vắng`}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#dcfce7', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#166534' }}>{pickedUp}</Typography>
                <Typography variant="caption" sx={{ color:  '#166534' }}>Đã đón/trả</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fef3c7', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#92400e' }}>{pending}</Typography>
                <Typography variant="caption" sx={{ color:  '#92400e' }}>Chờ đón</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fee2e2', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#dc2626' }}>{absent}</Typography>
                <Typography variant="caption" sx={{ color: '#dc2626' }}>Vắng mặt</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Danh sách học sinh */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', maxHeight: 400 }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom:  '1px solid #e2e8f0' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SchoolIcon sx={{ color: '#6366f1' }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Danh sách học sinh ({totalStudents})
                </Typography>
              </Stack>
            </Box>
            
            <List sx={{ maxHeight: 320, overflow: 'auto', p: 1 }}>
              {studentStops.length > 0 ?  (
                studentStops.map((ss, index) => {
                  const statusCfg = getStudentStatusConfig(ss?. action)
                  const studentName = ss?.studentId?.name || `Học sinh ${index + 1}`
                  const stationName = ss?. stationId?.name || ''
                  
                  return (
                    <ListItem 
                      key={ss?. studentId?._id || `student-${index}`}
                      sx={{ 
                        borderRadius: 2, 
                        mb: 0.5,
                        bgcolor: statusCfg.bgcolor,
                        border: `1px solid ${statusCfg.color}20`
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: statusCfg.color, width: 40, height: 40 }}>
                          {statusCfg.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>{studentName}</Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip 
                              label={statusCfg.label} 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                bgcolor: 'white',
                                color: statusCfg.color,
                                fontWeight: 500
                              }} 
                            />
                            {ss?.timestamp && (
                              <Typography variant="caption" color="text. secondary">
                                {new Date(ss.timestamp).toLocaleTimeString('vi-VN', { hour:  '2-digit', minute: '2-digit' })}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                      {stationName && (
                        <Tooltip title={`Trạm: ${stationName}`}>
                          <PlaceIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </Tooltip>
                      )}
                    </ListItem>
                  )
                })
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HelpOutlineIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1 }} />
                  <Typography color="text.secondary">Chưa có học sinh trong chuyến</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}