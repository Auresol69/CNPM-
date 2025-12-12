import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Chip, Stack, Tooltip,
  CircularProgress, Avatar, TablePagination, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import MapIcon from '@mui/icons-material/Map'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import PersonIcon from '@mui/icons-material/Person'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import TodayIcon from '@mui/icons-material/Today'
import GroupIcon from '@mui/icons-material/Group'
import { useNavigate } from 'react-router-dom'
import { AdminService } from '../api/services'
import ScheduleFormDialog from '../components/ScheduleFormDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotify } from '../hooks/useNotify'

export default function Schedules() {
  const navigate = useNavigate()
  const notify = useNotify()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null })

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  // Creating trip state
  const [creatingTrip, setCreatingTrip] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await AdminService.listSchedules()
      setRows(data || [])
    } catch (error) {
      console.error('Error:', error)
      notify.error('Không thể tải danh sách lịch trình')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onAdd = () => { setEditing(null); setOpen(true) }
  const onEdit = (row) => { setEditing(row); setOpen(true); handleCloseMenu() }
  const onDelete = (row) => { setConfirm({ open: true, row }); handleCloseMenu() }
  const onViewMap = (row) => navigate(`/admin/schedules/${row._id || row.schedule_id}`)

  // Menu handlers
  const handleOpenMenu = (event, schedule) => {
    setMenuAnchor(event.currentTarget)
    setSelectedSchedule(schedule)
  }

  const handleCloseMenu = () => {
    setMenuAnchor(null)
    setSelectedSchedule(null)
  }

  // 🔴 TẠO CHUYẾN ĐI TỪ LỊCH TRÌNH
  const handleCreateTrip = async (schedule) => {
    handleCloseMenu()
    setCreatingTrip(true)

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await AdminService.createTrip({
        scheduleId: schedule._id || schedule.schedule_id,
        tripDate: today.toISOString()
      })

      notify.success(`🚌 Đã tạo chuyến đi cho hôm nay! `)

      // Chuyển đến trang trips
      navigate('/admin/trips')
    } catch (error) {
      console.error('Error creating trip:', error)
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || 'Không thể tạo chuyến đi'

      // Check if it's a duplicate error
      if (error.response?.status === 409 || errorMsg.includes('duplicate') || errorMsg.includes('đã tồn tại')) {
        notify.warning('⚠️ Chuyến đi hôm nay đã được tạo trước đó!')
      } else {
        notify.error(errorMsg)
      }
    } finally {
      setCreatingTrip(false)
    }
  }

  const confirmDelete = async () => {
    try {
      if (confirm.row) {
        await AdminService.deleteSchedule(confirm.row._id || confirm.row.schedule_id)
        notify.success('Xóa lịch trình thành công')
        fetchData()
      }
    } catch {
      notify.error('Có lỗi xảy ra')
    }
    setConfirm({ open: false, row: null })
  }

  const onSubmit = async (form) => {
    try {
      if (editing) {
        await AdminService.updateSchedule(editing._id || editing.schedule_id, form)
        notify.success('Cập nhật thành công')
      } else {
        await AdminService.createSchedule(form)
        notify.success('Tạo lịch trình thành công')
      }
      setOpen(false)
      setEditing(null)
      fetchData()
    } catch (error) {
      notify.error(error.response?.data?.msg || 'Có lỗi xảy ra')
    }
  }

  const getDaysLabel = (days) => {
    if (!days || days.length === 0) return '—'
    const dayNames = ['', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    return days.map(d => dayNames[d] || d).join(', ')
  }

  // Check if schedule is active today
  const isActiveToday = (schedule) => {
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()

    if (!schedule.daysOfWeek?.includes(dayOfWeek)) return false

    const startDate = schedule.startDate ? new Date(schedule.startDate) : null
    const endDate = schedule.endDate ? new Date(schedule.endDate) : null

    if (startDate) {
      startDate.setHours(0, 0, 0, 0)
      if (today < startDate) return false
    }
    if (endDate) {
      endDate.setHours(23, 59, 59, 999)
      if (today > endDate) return false
    }

    return true
  }

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Stats
  const activeToday = rows.filter(isActiveToday).length
  const totalStudents = rows.reduce((sum, s) => sum + (s.total_students || 0), 0)

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            📅 Quản lý lịch trình
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip
              icon={<CalendarMonthIcon />}
              label={`${rows.length} lịch trình`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<TodayIcon />}
              label={`${activeToday} hoạt động hôm nay`}
              color="success"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<GroupIcon />}
              label={`${totalStudents} học sinh`}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ borderRadius: 2 }}>
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)' }
            }}
          >
            Thêm lịch trình
          </Button>
        </Stack>
      </Stack>

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
                  <TableCell sx={{ fontWeight: 600 }}>Tuyến đường</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Xe buýt</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tài xế</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Loại</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ngày hoạt động</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Học sinh</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((schedule, index) => {
                    const isToday = isActiveToday(schedule)

                    return (
                      <TableRow
                        key={schedule._id || schedule.schedule_id || index}
                        hover
                        sx={{
                          bgcolor: isToday ? '#f0fdf4' : 'inherit',
                          '&:hover': { bgcolor: isToday ? '#dcfce7' : '#f8fafc' }
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: '#ec4899', width: 40, height: 40 }}>
                              <CalendarMonthIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={600}>
                                  {schedule.route_name || schedule.routeId?.name || '—'}
                                </Typography>
                                {isToday && (
                                  <Chip
                                    label="Hôm nay"
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      bgcolor: '#22c55e',
                                      color: 'white'
                                    }}
                                  />
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                ID: {(schedule._id || schedule.schedule_id)?.slice(-6)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<DirectionsBusIcon />}
                            label={schedule.bus_plate || schedule.busId?.licensePlate || '—'}
                            size="small"
                            sx={{ bgcolor: '#fef3c7', color: '#92400e' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                            <Typography variant="body2">
                              {schedule.driver_name || schedule.driverId?.name || '—'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={schedule.direction === 'PICK_UP' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                            label={schedule.direction === 'PICK_UP' ? 'Đón' : 'Trả'}
                            size="small"
                            sx={{
                              bgcolor: schedule.direction === 'PICK_UP' ? '#dcfce7' : '#dbeafe',
                              color: schedule.direction === 'PICK_UP' ? '#166534' : '#1d4ed8'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={getDaysLabel(schedule.daysOfWeek)} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={schedule.total_students || 0}
                            size="small"
                            sx={{
                              bgcolor: schedule.total_students > 0 ? '#e0e7ff' : '#f1f5f9',
                              color: schedule.total_students > 0 ? '#4338ca' : '#64748b',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {/* Nút tạo chuyến đi - chỉ hiện khi lịch trình active hôm nay */}
                            {isToday && (
                              <Tooltip title="Tạo chuyến đi hôm nay">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCreateTrip(schedule)}
                                  disabled={creatingTrip}
                                  sx={{
                                    color: '#22c55e',
                                    bgcolor: '#dcfce7',
                                    '&:hover': { bgcolor: '#bbf7d0' }
                                  }}
                                >
                                  {creatingTrip ? (
                                    <CircularProgress size={18} color="inherit" />
                                  ) : (
                                    <PlayArrowIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Xem bản đồ & Gán học sinh">
                              <IconButton
                                size="small"
                                onClick={() => onViewMap(schedule)}
                                sx={{
                                  color: '#6366f1',
                                  bgcolor: '#e0e7ff',
                                  '&:hover': { bgcolor: '#c7d2fe' }
                                }}
                              >
                                <MapIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {/* More menu */}
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, schedule)}
                              sx={{ color: '#64748b' }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CalendarMonthIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                      <Typography color="text.secondary">Chưa có lịch trình nào</Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={onAdd}
                        sx={{ mt: 2 }}
                        variant="outlined"
                      >
                        Tạo lịch trình đầu tiên
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số dòng:"
          />
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 180 }
        }}
      >
        <MenuItem onClick={() => selectedSchedule && onViewMap(selectedSchedule)}>
          <ListItemIcon>
            <MapIcon fontSize="small" sx={{ color: '#6366f1' }} />
          </ListItemIcon>
          <ListItemText>Xem bản đồ</ListItemText>
        </MenuItem>

        {selectedSchedule && isActiveToday(selectedSchedule) && (
          <MenuItem onClick={() => selectedSchedule && handleCreateTrip(selectedSchedule)}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" sx={{ color: '#22c55e' }} />
            </ListItemIcon>
            <ListItemText>Tạo chuyến hôm nay</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => selectedSchedule && onEdit(selectedSchedule)}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#f59e0b' }} />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => selectedSchedule && onDelete(selectedSchedule)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText sx={{ color: '#ef4444' }}>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <ScheduleFormDialog
        open={open}
        onClose={() => setOpen(false)}
        initialValue={editing}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Xóa lịch trình"
        message={`Bạn có chắc muốn xóa lịch trình "${confirm.row?.route_name || confirm.row?.routeId?.name || ''}"? Hành động này không thể hoàn tác. `}
        cancelText="Hủy"
        okText="Xóa"
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </Box>
  )
}