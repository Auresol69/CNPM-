import React, { useEffect, useState, useMemo } from 'react'
import {
  Box, Typography, Paper, Stack, Chip, CircularProgress, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Divider, Badge,
  IconButton, Tooltip, TextField, InputAdornment, Alert, Button,
  Drawer, Grid, Card, CardContent, LinearProgress
} from '@mui/material'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PersonIcon from '@mui/icons-material/Person'
import PlaceIcon from '@mui/icons-material/Place'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ScheduleIcon from '@mui/icons-material/Schedule'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import RouteIcon from '@mui/icons-material/Route'
import SchoolIcon from '@mui/icons-material/School'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CloseIcon from '@mui/icons-material/Close'
import SpeedIcon from '@mui/icons-material/Speed'
import NavigationIcon from '@mui/icons-material/Navigation'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AdminService } from '../../services/admin/AdminService'
import { useSocket } from './hooks/useSocket'
import { useNotify } from './hooks/useNotify'
import { useNavigate } from 'react-router-dom'

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom Bus Icon với animation
const createBusIcon = (isMoving = false, direction = 0) => L.divIcon({
  className: 'bus-marker-tracking',
  html: `
    <div style="
      position: relative;
      width: 50px;
      height: 50px;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        ${isMoving ? 'animation: pulse-bus 1.5s infinite;' : ''}
      ">
        <span style="font-size: 24px; transform: rotate(${direction}deg);">🚌</span>
      </div>
      ${isMoving ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 3px solid #f59e0b;
          border-radius: 50%;
          animation: ripple 1.5s infinite;
          opacity: 0;
        "></div>
      ` : ''}
    </div>
    <style>
      @keyframes pulse-bus {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
      }
      @keyframes ripple {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25]
})

// Custom Station Icon
const createStationIcon = (type = 'normal') => {
  const colors = {
    start: '#22c55e',
    end: '#ef4444',
    normal: '#6366f1',
    current: '#f59e0b'
  }
  const color = colors[type] || colors.normal

  return L.divIcon({
    className: 'station-marker-tracking',
    html: `
      <div style="
        background: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Component để center map vào một vị trí
function MapController({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15, { duration: 1 })
    }
  }, [center, zoom, map])

  return null
}

export default function Tracking() {
  const navigate = useNavigate()
  const notify = useNotify()

  // States
  const [loading, setLoading] = useState(true)
  const [activeTrips, setActiveTrips] = useState([])
  const [busPositions, setBusPositions] = useState({}) // { tripId: { lat, lng, timestamp, speed } }
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState(null)

  // Socket.IO
  const {
    connected,
    joinTrip,
    leaveTrip,
    onBusLocationUpdate,
    onStudentCheckedIn,
    onBusApproaching,
    onBusArrived
  } = useSocket()

  // Fetch active trips
  const fetchActiveTrips = async () => {
    setLoading(true)
    try {
      const allTrips = await AdminService.listTrips()

      // Lọc các chuyến đang chạy hoặc chưa bắt đầu trong ngày hôm nay
      const today = new Date().toISOString().split('T')[0]
      const todayTrips = allTrips.filter(trip => {
        const tripDate = trip.tripDate?.split('T')[0]
        return tripDate === today && (trip.status === 'IN_PROGRESS' || trip.status === 'NOT_STARTED')
      })

      setActiveTrips(todayTrips)

      // Nếu có chuyến đang chạy, tự động chọn chuyến đầu tiên
      const inProgressTrips = todayTrips.filter(t => t.status === 'IN_PROGRESS')
      if (inProgressTrips.length > 0 && !selectedTrip) {
        handleSelectTrip(inProgressTrips[0])
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
      notify.error('Không thể tải danh sách chuyến đi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveTrips()

    // Auto refresh mỗi 60s
    const interval = setInterval(fetchActiveTrips, 60000)
    return () => clearInterval(interval)
  }, [])

  // Lắng nghe vị trí xe từ tất cả các chuyến
  useEffect(() => {
    if (connected) {
      // Join tất cả các trip rooms
      activeTrips.forEach(trip => {
        if (trip.status === 'IN_PROGRESS') {
          joinTrip(trip._id || trip.trip_id)
        }
      })

      // Lắng nghe location updates
      const cleanup = onBusLocationUpdate((data) => {
        console.log('📍 Bus location update:', data)
        setBusPositions(prev => ({
          ...prev,
          [data.tripId]: {
            lat: data.latitude,
            lng: data.longitude,
            timestamp: new Date(data.timestamp || Date.now()),
            speed: data.speed || 0,
            heading: data.heading || 0
          }
        }))
      })

      return () => {
        cleanup && cleanup()
        activeTrips.forEach(trip => {
          leaveTrip(trip._id || trip.trip_id)
        })
      }
    }
  }, [connected, activeTrips, joinTrip, leaveTrip, onBusLocationUpdate])

  // Lắng nghe sự kiện check-in
  useEffect(() => {
    if (connected && selectedTrip) {
      const cleanup = onStudentCheckedIn((data) => {
        notify.success(`🎉 Học sinh đã ${data.action === 'PICKED_UP' ? 'lên xe' : 'xuống xe'}! `)
        // Refresh trip data
        if (selectedTrip) {
          handleSelectTrip(selectedTrip, true)
        }
      })

      return cleanup
    }
  }, [connected, selectedTrip, onStudentCheckedIn, notify])

  // Chọn trip để xem chi tiết
  const handleSelectTrip = async (trip, forceRefresh = false) => {
    try {
      // Nếu đã chọn trip này rồi và không force refresh
      if (selectedTrip?._id === trip._id && !forceRefresh) {
        setDrawerOpen(true)
        return
      }

      const tripDetail = await AdminService.getTrip(trip._id || trip.trip_id)
      setSelectedTrip(tripDetail)
      setDrawerOpen(true)

      // Center map vào route
      if (tripDetail.routeId?.shape?.coordinates?.length > 0) {
        const coords = tripDetail.routeId.shape.coordinates
        const midIndex = Math.floor(coords.length / 2)
        setMapCenter([coords[midIndex][1], coords[midIndex][0]])
      }
    } catch (error) {
      console.error('Error fetching trip detail:', error)
      notify.error('Không thể tải chi tiết chuyến đi')
    }
  }

  // Focus vào xe
  const focusOnBus = (tripId) => {
    const position = busPositions[tripId]
    if (position) {
      setMapCenter([position.lat, position.lng])
    }
  }

  // Filter trips
  const filteredTrips = useMemo(() => {
    if (!searchTerm) return activeTrips

    const term = searchTerm.toLowerCase()
    return activeTrips.filter(trip =>
      trip.route_name?.toLowerCase().includes(term) ||
      trip.bus_plate?.toLowerCase().includes(term) ||
      trip.driver_name?.toLowerCase().includes(term)
    )
  }, [activeTrips, searchTerm])

  // Stats
  const stats = useMemo(() => {
    const inProgress = activeTrips.filter(t => t.status === 'IN_PROGRESS').length
    const notStarted = activeTrips.filter(t => t.status === 'NOT_STARTED').length
    const totalStudents = activeTrips.reduce((sum, t) => sum + (t.total_students || 0), 0)
    const pickedUp = activeTrips.reduce((sum, t) => sum + (t.picked_up || 0), 0)

    return { inProgress, notStarted, totalStudents, pickedUp }
  }, [activeTrips])

  // Lấy polyline positions cho selected trip
  const selectedTripPolyline = useMemo(() => {
    if (!selectedTrip?.routeId?.shape?.coordinates) return []
    return selectedTrip.routeId.shape.coordinates.map(coord => [coord[1], coord[0]])
  }, [selectedTrip])

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
                📡 Theo dõi GPS Realtime
              </Typography>
              <Chip
                icon={connected ? <WifiIcon /> : <WifiOffIcon />}
                label={connected ? 'Đang kết nối' : 'Mất kết nối'}
                size="small"
                sx={{
                  bgcolor: connected ? '#dcfce7' : '#fee2e2',
                  color: connected ? '#166534' : '#dc2626',
                  fontWeight: 600,
                  animation: connected ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 }
                  }
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Chip
                icon={<PlayArrowIcon />}
                label={`${stats.inProgress} đang chạy`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<ScheduleIcon />}
                label={`${stats.notStarted} chờ khởi hành`}
                size="small"
                color="warning"
                variant="outlined"
              />
              <Chip
                icon={<SchoolIcon />}
                label={`${stats.pickedUp}/${stats.totalStudents} học sinh`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <TextField
              placeholder="Tìm kiếm..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, width: 200 }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchActiveTrips}
              sx={{ borderRadius: 2 }}
            >
              Làm mới
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
        {/* Sidebar - Danh sách chuyến */}
        <Paper sx={{
          width: 360,
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              🚌 Chuyến đi hôm nay ({filteredTrips.length})
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : filteredTrips.length > 0 ? (
            <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {filteredTrips.map((trip, index) => {
                const isSelected = selectedTrip?._id === trip._id
                const isInProgress = trip.status === 'IN_PROGRESS'
                const hasPosition = busPositions[trip._id || trip.trip_id]
                const progress = trip.total_students > 0
                  ? Math.round(((trip.picked_up || 0) / trip.total_students) * 100)
                  : 0

                return (
                  <ListItem
                    key={trip._id || trip.trip_id || index}
                    onClick={() => handleSelectTrip(trip)}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      bgcolor: isSelected ? '#e0e7ff' : 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: isSelected ? '#e0e7ff' : '#f8fafc',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          hasPosition ? (
                            <Box sx={{
                              width: 12,
                              height: 12,
                              bgcolor: '#22c55e',
                              borderRadius: '50%',
                              border: '2px solid white',
                              animation: 'pulse 1.5s infinite'
                            }} />
                          ) : null
                        }
                      >
                        <Avatar sx={{
                          bgcolor: isInProgress ? '#f59e0b' : '#94a3b8',
                          width: 48,
                          height: 48
                        }}>
                          <DirectionsBusIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                            {trip.bus_plate || trip.busId?.licensePlate || 'N/A'}
                          </Typography>
                          <Chip
                            label={isInProgress ? 'Đang chạy' : 'Chờ'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: isInProgress ? '#dcfce7' : '#fef3c7',
                              color: isInProgress ? '#166534' : '#92400e'
                            }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {trip.route_name || trip.routeId?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            👤 {trip.driver_name || trip.driverId?.name || 'N/A'}
                          </Typography>
                          {isInProgress && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: '#e2e8f0',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: '#22c55e',
                                    borderRadius: 3
                                  }
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {trip.picked_up || 0}/{trip.total_students || 0} học sinh
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    {hasPosition && (
                      <Tooltip title="Xem vị trí xe">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            focusOnBus(trip._id || trip.trip_id)
                          }}
                          sx={{ color: '#6366f1' }}
                        >
                          <MyLocationIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItem>
                )
              })}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <DirectionsBusIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
              <Typography color="text.secondary">
                Không có chuyến đi nào hôm nay
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Map */}
        <Paper sx={{ flex: 1, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
          <MapContainer
            center={[10.7769, 106.7009]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Controller để center map */}
            {mapCenter && <MapController center={mapCenter} zoom={15} />}

            {/* Vẽ route của selected trip */}
            {selectedTripPolyline.length > 0 && (
              <Polyline
                positions={selectedTripPolyline}
                pathOptions={{
                  color: '#6366f1',
                  weight: 5,
                  opacity: 0.8,
                  dashArray: selectedTrip?.status !== 'IN_PROGRESS' ? '10, 10' : null
                }}
              />
            )}

            {/* Vẽ các trạm của selected trip */}
            {selectedTrip?.routeId?.orderedStops?.map((station, index) => {
              const isFirst = index === 0
              const isLast = index === selectedTrip.routeId.orderedStops.length - 1
              const isCurrent = index === selectedTrip.nextStationIndex
              const type = isFirst ? 'start' : isLast ? 'end' : isCurrent ? 'current' : 'normal'

              return (
                <Marker
                  key={station._id}
                  position={[station.address.latitude, station.address.longitude]}
                  icon={createStationIcon(type)}
                >
                  <Popup>
                    <Box sx={{ minWidth: 150 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {index + 1}. {station.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {station.address.fullAddress}
                      </Typography>
                      {isCurrent && selectedTrip.status === 'IN_PROGRESS' && (
                        <Chip
                          label="Trạm tiếp theo"
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Popup>
                </Marker>
              )
            })}

            {/* Vẽ tất cả xe đang chạy */}
            {Object.entries(busPositions).map(([tripId, position]) => {
              const trip = activeTrips.find(t => (t._id || t.trip_id) === tripId)
              if (!trip || !position) return null

              const isSelected = selectedTrip?._id === tripId

              return (
                <React.Fragment key={tripId}>
                  <Marker
                    position={[position.lat, position.lng]}
                    icon={createBusIcon(true, position.heading)}
                    eventHandlers={{
                      click: () => handleSelectTrip(trip)
                    }}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 200 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <DirectionsBusIcon sx={{ color: '#f59e0b' }} />
                          <Typography variant="subtitle2" fontWeight="bold">
                            {trip.bus_plate || 'N/A'}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          📍 {trip.route_name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          👤 {trip.driver_name || 'N/A'}
                        </Typography>
                        {position.speed > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            🚀 {Math.round(position.speed)} km/h
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Cập nhật: {position.timestamp.toLocaleTimeString('vi-VN')}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          sx={{ mt: 1, borderRadius: 1 }}
                          onClick={() => navigate(`/admin/trips/${tripId}`)}
                        >
                          Xem chi tiết
                        </Button>
                      </Box>
                    </Popup>
                  </Marker>

                  {/* Vòng tròn xung quanh xe */}
                  {isSelected && (
                    <Circle
                      center={[position.lat, position.lng]}
                      radius={100}
                      pathOptions={{
                        color: '#f59e0b',
                        fillColor: '#fef3c7',
                        fillOpacity: 0.3
                      }}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </MapContainer>

          {/* Legend */}
          <Paper sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            p: 2,
            borderRadius: 2,
            zIndex: 1000,
            bgcolor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 1.5, display: 'block' }}>
              📌 Chú thích
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ fontSize: 20 }}>🚌</Box>
                <Typography variant="caption">Xe buýt đang chạy</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#22c55e' }} />
                <Typography variant="caption">Trạm xuất phát</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                <Typography variant="caption">Trạm tiếp theo</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ef4444' }} />
                <Typography variant="caption">Điểm đích</Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* No data overlay */}
          {!loading && activeTrips.length === 0 && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              bgcolor: 'rgba(255,255,255,0.9)',
              p: 4,
              borderRadius: 3,
              zIndex: 1000
            }}>
              <DirectionsBusIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không có xe nào đang hoạt động
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Các chuyến đi sẽ hiển thị tại đây khi bắt đầu
              </Typography>
            </Box>
          )}

          {/* Connection status overlay */}
          {!connected && (
            <Alert
              severity="warning"
              sx={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                borderRadius: 2
              }}
            >
              Đang mất kết nối realtime. Vị trí xe có thể không cập nhật.
            </Alert>
          )}
        </Paper>
      </Box>

      {/* Drawer - Chi tiết chuyến đi */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 }, borderRadius: '16px 0 0 16px' }
        }}
      >
        {selectedTrip && (
          <>
            {/* Header */}
            <Box sx={{
              p: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white'
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    🚌 {selectedTrip.busId?.licensePlate || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {selectedTrip.routeId?.name || 'N/A'}
                  </Typography>
                  <Chip
                    label={selectedTrip.status === 'IN_PROGRESS' ? 'Đang chạy' :
                      selectedTrip.status === 'COMPLETED' ? 'Hoàn thành' : 'Chờ khởi hành'}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  />
                </Box>
                <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
              {/* Info Cards */}
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: '#f8fafc', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <PersonIcon sx={{ color: '#6366f1', fontSize: 28 }} />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Tài xế
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedTrip.driverId?.name || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: '#f8fafc', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <SchoolIcon sx={{ color: '#22c55e', fontSize: 28 }} />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Học sinh
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedTrip.studentStops?.filter(s => s.action === 'PICKED_UP').length || 0}/
                        {selectedTrip.studentStops?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Bus position info */}
              {busPositions[selectedTrip._id] && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#fef3c7', borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <NavigationIcon sx={{ color: '#f59e0b' }} />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#92400e' }}>
                      Vị trí hiện tại
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Chip
                      icon={<SpeedIcon />}
                      label={`${Math.round(busPositions[selectedTrip._id].speed || 0)} km/h`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={busPositions[selectedTrip._id].timestamp.toLocaleTimeString('vi-VN')}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Paper>
              )}

              {/* Stations */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                📍 Các trạm dừng
              </Typography>
              <List dense sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 1 }}>
                {selectedTrip.routeId?.orderedStops?.map((station, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === selectedTrip.routeId.orderedStops.length - 1
                  const isCurrent = idx === selectedTrip.nextStationIndex
                  const isPassed = idx < selectedTrip.nextStationIndex

                  return (
                    <ListItem
                      key={station._id}
                      sx={{
                        borderRadius: 1.5,
                        mb: 0.5,
                        bgcolor: isCurrent ? '#fef3c7' : isPassed ? '#dcfce7' : 'white',
                        border: isCurrent ? '2px solid #f59e0b' : '1px solid #e2e8f0'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 32,
                          height: 32,
                          bgcolor: isFirst ? '#22c55e' : isLast ? '#ef4444' : isCurrent ? '#f59e0b' : '#6366f1',
                          fontSize: '0.85rem'
                        }}>
                          {idx + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={station.name}
                        secondary={isCurrent ? '← Trạm tiếp theo' : isPassed ? '✓ Đã qua' : ''}
                        primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                        secondaryTypographyProps={{
                          color: isCurrent ? '#92400e' : '#166534',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  )
                })}
              </List>

              {/* Action buttons */}
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<MyLocationIcon />}
                  onClick={() => focusOnBus(selectedTrip._id)}
                  disabled={!busPositions[selectedTrip._id]}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  }}
                >
                  Xem vị trí xe
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/admin/trips/${selectedTrip._id}`)}
                  sx={{ borderRadius: 2 }}
                >
                  Xem chi tiết chuyến đi
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Drawer>
    </Box>
  )
}