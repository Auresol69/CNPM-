import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Chip, Stack, Tooltip,
  TextField, MenuItem, CircularProgress, Avatar, TablePagination
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import FilterListIcon from '@mui/icons-material/FilterList'
import TodayIcon from '@mui/icons-material/Today'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CancelIcon from '@mui/icons-material/Cancel'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { useNavigate } from 'react-router-dom'
import { AdminService } from '../api/services'
import { useNotify } from '../hooks/useNotify'

export default function Trips() {
  const navigate = useNavigate()
  const notify = useNotify()
  
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await AdminService. listTrips()
      console.log('Trips data:', data)
      setRows(data || [])
    } catch (error) {
      console.error('Error:', error)
      notify.error('Không thể tải danh sách chuyến đi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter data
  const filteredRows = rows.filter(trip => {
    // Filter by status
    if (filterStatus !== 'ALL' && trip.status !== filterStatus) return false
    
    // Filter by date
    if (filterDate) {
      const tripDate = trip.tripDate?. split('T')[0]
      if (tripDate !== filterDate) return false
    }
    
    return true
  })

  // Paginate
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Status config
  const getStatusConfig = (status) => {
    const configs = {
      'NOT_STARTED': { 
        label: 'Chưa bắt đầu', 
        color: 'default', 
        icon: <ScheduleIcon fontSize="small" />,
        bgcolor: '#f1f5f9',
        textColor: '#64748b'
      },
      'IN_PROGRESS': { 
        label: 'Đang chạy', 
        color: 'primary', 
        icon: <PlayArrowIcon fontSize="small" />,
        bgcolor: '#dbeafe',
        textColor: '#1d4ed8'
      },
      'COMPLETED': { 
        label: 'Hoàn thành', 
        color: 'success', 
        icon: <CheckCircleIcon fontSize="small" />,
        bgcolor: '#dcfce7',
        textColor: '#166534'
      },
      'CANCELLED': { 
        label: 'Đã hủy', 
        color: 'error', 
        icon: <CancelIcon fontSize="small" />,
        bgcolor: '#fee2e2',
        textColor: '#dc2626'
      }
    }
    return configs[status] || configs['NOT_STARTED']
  }

  // Stats
  const todayTrips = rows.filter(t => t.tripDate?. startsWith(filterDate))
  const activeTrips = todayTrips.filter(t => t. status === 'IN_PROGRESS')
  const completedTrips = todayTrips.filter(t => t.status === 'COMPLETED')

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            🚌 Quản lý chuyến đi
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip
              icon={<TodayIcon />}
              label={`${todayTrips. length} chuyến hôm nay`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<PlayArrowIcon />}
              label={`${activeTrips. length} đang chạy`}
              color="info"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<CheckCircleIcon />}
              label={`${completedTrips.length} hoàn thành`}
              color="success"
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchData} 
          sx={{ borderRadius: 2 }}
        >
          Làm mới
        </Button>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterListIcon sx={{ color: '#64748b' }} />
          <TextField
            label="Ngày"
            type="date"
            size="small"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target. value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
          <TextField
            select
            label="Trạng thái"
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target. value)}
            sx={{ width: 180 }}
          >
            <MenuItem value="ALL">Tất cả</MenuItem>
            <MenuItem value="NOT_STARTED">Chưa bắt đầu</MenuItem>
            <MenuItem value="IN_PROGRESS">Đang chạy</MenuItem>
            <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
            <MenuItem value="CANCELLED">Đã hủy</MenuItem>
          </TextField>
          <Chip 
            label={`${filteredRows.length} kết quả`} 
            size="small" 
            sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}
          />
        </Stack>
      </Paper>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tuyến đường</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Xe</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tài xế</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Loại</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((trip, index) => {
                    const statusConfig = getStatusConfig(trip.status)
                    const tripDate = trip.tripDate 
                      ? new Date(trip.tripDate).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit'
                        })
                      : '—'
                    
                    return (
                      <TableRow 
                        key={trip._id || trip.trip_id || index} 
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                        onClick={() => navigate(`/admin/trips/${trip._id || trip.trip_id}`)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {tripDate}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366f1' }}>
                              <DirectionsBusIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {trip.route_name || trip.routeId?. name || '—'}
                              </Typography>
                              <Typography variant="caption" color="text. secondary">
                                ID: {(trip._id || trip.trip_id)?.slice(-6)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={trip.bus_plate || trip.busId?.licensePlate || '—'}
                            size="small"
                            sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {trip.driver_name || trip. driverId?.name || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={trip.direction === 'PICK_UP' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                            label={trip.direction === 'PICK_UP' ? 'Đón' : 'Trả'}
                            size="small"
                            sx={{
                              bgcolor: trip.direction === 'PICK_UP' ? '#dcfce7' : '#dbeafe',
                              color: trip. direction === 'PICK_UP' ?  '#166534' : '#1d4ed8',
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.bgcolor,
                              color: statusConfig.textColor,
                              fontWeight: 500,
                              '& .MuiChip-icon': { color: statusConfig.textColor }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e. stopPropagation()}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              sx={{ 
                                color: '#6366f1', 
                                bgcolor: '#e0e7ff',
                                '&:hover': { bgcolor: '#c7d2fe' }
                              }}
                              onClick={() => navigate(`/admin/trips/${trip._id || trip.trip_id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <DirectionsBusIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                      <Typography color="text.secondary">
                        Không có chuyến đi nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số dòng:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </Paper>
      )}
    </Box>
  )
}