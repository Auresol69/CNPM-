import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Stack, Button, Chip, CircularProgress,
  Drawer, List, ListItem, ListItemAvatar, ListItemText, Avatar,
  Checkbox, Divider, Alert, IconButton, Tooltip, Badge
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlaceIcon from '@mui/icons-material/Place'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import RefreshIcon from '@mui/icons-material/Refresh'
import SchoolIcon from '@mui/icons-material/School'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RouteIcon from '@mui/icons-material/Route'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AdminService } from '../../services/admin/AdminService'
import { useNotify } from './hooks/useNotify'

// Fix icon Leaflet mặc định
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Helper: Lấy tọa độ station từ nhiều format khác nhau
const getStationPosition = (station) => {
  // Format 1: address.location.coordinates [lng, lat] (GeoJSON)
  if (station?.address?.location?.coordinates?.length >= 2) {
    const [lng, lat] = station.address.location.coordinates
    return [lat, lng]
  }
  // Format 2: address.latitude / address.longitude (legacy)
  if (station?.address?.latitude && station?.address?.longitude) {
    return [station.address.latitude, station.address.longitude]
  }
  // Fallback: Trung tâm HCM
  console.warn('Station missing coordinates:', station?.name)
  return [10.7769, 106.7009]
}

// Custom icon cho trạm
const createStationIcon = (color, number) => L.divIcon({
  className: 'custom-station-marker',
  html: `
    <div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 3px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      color: white;
      font-family: Arial, sans-serif;
    ">
      ${number}
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
})

// Component để fit bounds tự động
function FitBounds({ coordinates }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = coordinates.map(coord => [coord[1], coord[0]])
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [coordinates, map])
  return null
}

export default function ScheduleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const notify = useNotify()

  // States
  const [loading, setLoading] = useState(true)
  const [routeData, setRouteData] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [nearbyStudents, setNearbyStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [assigning, setAssigning] = useState(false)

  // Lấy thông tin route của schedule
  const fetchRouteData = async () => {
    setLoading(true)
    try {
      const response = await AdminService.getScheduleRoute(id)
      console.log('Route data:', response)
      setRouteData(response)
    } catch (error) {
      console.error('Error fetching route:', error)
      notify.error('Không thể tải thông tin lịch trình')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRouteData()
  }, [id])

  // Khi click vào trạm → lấy danh sách học sinh gần đó
  const handleStationClick = async (station) => {
    setSelectedStation(station)
    setDrawerOpen(true)
    setLoadingStudents(true)
    setSelectedStudentIds([])

    try {
      const response = await AdminService.getStation(station._id)
      console.log('Station detail:', response)
      setNearbyStudents(response.students || [])
    } catch (error) {
      console.error('Error fetching station students:', error)
      notify.error('Không thể tải danh sách học sinh')
      setNearbyStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  // Toggle chọn học sinh
  const toggleStudent = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  // Chọn tất cả học sinh chưa gán
  const selectAllUnassigned = () => {
    const unassignedIds = nearbyStudents
      .filter(s => !s.isAssigned)
      .map(s => s._id)
    setSelectedStudentIds(unassignedIds)
  }

  // Bỏ chọn tất cả
  const deselectAll = () => {
    setSelectedStudentIds([])
  }

  // Gán học sinh vào trạm
  const handleAssignStudents = async () => {
    if (selectedStudentIds.length === 0) {
      notify.error('Vui lòng chọn ít nhất 1 học sinh')
      return
    }

    setAssigning(true)
    try {
      await AdminService.assignStudentsToStation(id, selectedStation._id, selectedStudentIds)
      notify.success(`🎉 Đã gán ${selectedStudentIds.length} học sinh vào trạm "${selectedStation.name}"`)
      
      // Refresh danh sách
      handleStationClick(selectedStation)
    } catch (error) {
      console.error('Error assigning students:', error)
      notify.error(error.response?.data?.message || 'Không thể gán học sinh')
    } finally {
      setAssigning(false)
    }
  }

  // Đóng drawer
  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedStation(null)
    setSelectedStudentIds([])
  }

  // Tính toán stats
  const assignedStudents = useMemo(() => 
    nearbyStudents.filter(s => s.isAssigned), [nearbyStudents]
  )
  const unassignedStudents = useMemo(() => 
    nearbyStudents.filter(s => !s.isAssigned), [nearbyStudents]
  )

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
        <Typography sx={{ mt: 2, color: '#64748b' }}>Đang tải bản đồ...</Typography>
      </Box>
    )
  }

  // Error state
  if (!routeData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Không tìm thấy thông tin lịch trình. Vui lòng thử lại.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/schedules')} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    )
  }

  // Chuyển đổi coordinates cho Polyline (Leaflet dùng [lat, lng])
  const polylinePositions = routeData.shape?.coordinates?.map(coord => [coord[1], coord[0]]) || []

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton 
              onClick={() => navigate('/admin/schedules')}
              sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                🗺️ {routeData.routeName || 'Chi tiết lịch trình'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip
                  size="small"
                  icon={<PlaceIcon />}
                  label={`${routeData.stops?.length || 0} trạm`}
                  sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}
                />
                <Chip
                  size="small"
                  icon={<RouteIcon />}
                  label={routeData.distance ? `${(routeData.distance / 1000).toFixed(1)} km` : '—'}
                  sx={{ bgcolor: '#dcfce7', color: '#166534' }}
                />
                <Chip
                  size="small"
                  icon={<AccessTimeIcon />}
                  label={routeData.duration ? `~${Math.round(routeData.duration / 60)} phút` : '—'}
                  sx={{ bgcolor: '#fef3c7', color: '#92400e' }}
                />
              </Stack>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRouteData}
            sx={{ borderRadius: 2 }}
          >
            Làm mới
          </Button>
        </Stack>
      </Paper>

      {/* Bản đồ */}
      <Paper sx={{ flex: 1, borderRadius: 3, overflow: 'hidden', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <MapContainer
          center={[10.7769, 106.7009]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fit bounds theo tuyến đường */}
          {routeData.shape?.coordinates && (
            <FitBounds coordinates={routeData.shape.coordinates} />
          )}

          {/* Vẽ đường tuyến */}
          {polylinePositions.length > 0 && (
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#6366f1',
                weight: 6,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )}

          {/* Vẽ các trạm */}
          {routeData.stops?.map((station, index) => {
            const isFirst = index === 0
            const isLast = index === routeData.stops.length - 1
            const color = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#6366f1'
            
            return (
              <Marker
                key={station._id}
                position={getStationPosition(station)}
                icon={createStationIcon(color, index + 1)}
                eventHandlers={{
                  click: () => handleStationClick(station)
                }}
              >
                <Popup>
                  <Box sx={{ minWidth: 220, p: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: 14 }}>
                        {index + 1}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {station.name}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      📍 {station.address?.fullAddress || 'Chưa có địa chỉ'}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PersonIcon />}
                      onClick={() => handleStationClick(station)}
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#6366f1',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#4f46e5' }
                      }}
                    >
                      Xem & Gán học sinh
                    </Button>
                  </Box>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {/* Chú thích */}
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

        {/* Hướng dẫn */}
        <Paper sx={{ 
          position: 'absolute', 
          top: 20, 
          right: 20, 
          p: 2, 
          borderRadius: 2, 
          zIndex: 1000, 
          maxWidth: 280,
          bgcolor: '#fffbeb',
          border: '1px solid #fcd34d',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body2" sx={{ color: '#92400e' }}>
            💡 <strong>Hướng dẫn:</strong> Click vào các trạm trên bản đồ để xem danh sách học sinh ở gần và gán vào lịch trình này.
          </Typography>
        </Paper>
      </Paper>

      {/* Drawer - Danh sách học sinh gần trạm */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ 
          sx: { 
            width: { xs: '100%', sm: 420 }, 
            p: 0,
            borderRadius: '16px 0 0 16px'
          } 
        }}
      >
        {/* Header Drawer */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          p: 2.5, 
          color: 'white'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, pr: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PlaceIcon />
                <Typography variant="h6" fontWeight="bold">
                  {selectedStation?.name}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                📍 {selectedStation?.address?.fullAddress}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip
                  size="small"
                  label={`${assignedStudents.length} đã gán`}
                  sx={{ bgcolor: 'rgba(34,197,94,0.3)', color: 'white' }}
                />
                <Chip
                  size="small"
                  label={`${unassignedStudents.length} gợi ý`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Stack>
            </Box>
            <IconButton onClick={closeDrawer} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Nội dung */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loadingStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Học sinh đã gán */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#166534' }}>
                    Đã gán vào lịch trình ({assignedStudents.length})
                  </Typography>
                </Stack>
                
                {assignedStudents.length > 0 ? (
                  <List dense sx={{ bgcolor: '#f0fdf4', borderRadius: 2, p: 1 }}>
                    {assignedStudents.map((student, idx) => (
                      <ListItem 
                        key={student._id}
                        sx={{ 
                          borderRadius: 1.5, 
                          mb: idx < assignedStudents.length - 1 ? 0.5 : 0,
                          bgcolor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#22c55e', width: 36, height: 36 }}>
                            <CheckCircleIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={student.name}
                          secondary={`Lớp ${student.grade}`}
                          primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Paper sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có học sinh nào được gán
                    </Typography>
                  </Paper>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Học sinh gợi ý (chưa gán) */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MyLocationIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#92400e' }}>
                      Học sinh gần trạm ({unassignedStudents.length})
                    </Typography>
                  </Stack>
                  {unassignedStudents.length > 0 && (
                    <Stack direction="row" spacing={1}>
                      {selectedStudentIds.length > 0 ? (
                        <Button size="small" onClick={deselectAll} sx={{ fontSize: '0.75rem' }}>
                          Bỏ chọn
                        </Button>
                      ) : (
                        <Button size="small" onClick={selectAllUnassigned} sx={{ fontSize: '0.75rem' }}>
                          Chọn tất cả
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>

                {unassignedStudents.length > 0 ? (
                  <List dense sx={{ bgcolor: '#fffbeb', borderRadius: 2, p: 1 }}>
                    {unassignedStudents.map((student, idx) => (
                      <ListItem
                        key={student._id}
                        onClick={() => toggleStudent(student._id)}
                        sx={{
                          bgcolor: selectedStudentIds.includes(student._id) ? '#fef3c7' : 'white',
                          borderRadius: 1.5,
                          mb: idx < unassignedStudents.length - 1 ? 0.5 : 0,
                          cursor: 'pointer',
                          border: selectedStudentIds.includes(student._id) 
                            ? '2px solid #f59e0b' 
                            : '1px solid transparent',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: '#fef3c7'
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedStudentIds.includes(student._id)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#f59e0b', width: 36, height: 36 }}>
                            <SchoolIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={student.name}
                          secondary={`Lớp ${student.grade}`}
                          primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Paper sx={{ p: 3, bgcolor: '#fffbeb', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có học sinh nào ở gần trạm này (trong bán kính 500m)
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Thông tin bổ sung */}
              {unassignedStudents.length > 0 && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="caption">
                    📍 Danh sách trên là các học sinh có địa chỉ nhà trong bán kính <strong>500m</strong> từ trạm này. 
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </Box>

        {/* Footer - Nút gán */}
        {unassignedStudents.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={assigning ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              onClick={handleAssignStudents}
              disabled={selectedStudentIds.length === 0 || assigning}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: selectedStudentIds.length > 0 
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : '#e2e8f0',
                fontWeight: 600,
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                }
              }}
            >
              {assigning 
                ? 'Đang gán...' 
                : selectedStudentIds.length > 0 
                  ? `Gán ${selectedStudentIds.length} học sinh vào trạm`
                  : 'Chọn học sinh để gán'
              }
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  )
}