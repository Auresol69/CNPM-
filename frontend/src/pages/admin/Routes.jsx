import React, { useEffect, useState } from 'react'
import {
  Box, Button, Chip, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip,
  Collapse, CircularProgress, Avatar, TablePagination
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RouteIcon from '@mui/icons-material/AltRoute'
import PlaceIcon from '@mui/icons-material/Place'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StraightenIcon from '@mui/icons-material/Straighten'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { AdminService } from '../../services/admin/AdminService'
import RouteFormDialog from '../../components/admin/RouteFormDialog'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { useNotify } from './hooks/useNotify'

export default function RoutesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null })
  const [expandedId, setExpandedId] = useState(null)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const notify = useNotify()

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await AdminService.listRoutes()
      setRows(data || [])
    } catch (error) {
      console.error('Error fetching routes:', error)
      notify.error('Không thể tải danh sách tuyến đường')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onAdd = () => { setEditing(null); setOpen(true) }
  const onEdit = (row) => { setEditing(row); setOpen(true) }
  const onDelete = (row) => setConfirm({ open: true, row })

  const confirmDelete = async () => {
    try {
      if (confirm.row) {
        await AdminService.deleteRoute(confirm.row._id || confirm.row.route_id)
        notify.success('Xóa thành công')
        fetchData()
      }
    } catch (error) {
      notify.error(error.response?.data?.msg || 'Có lỗi xảy ra')
    }
    setConfirm({ open: false, row: null })
  }

  const onSubmit = async (form) => {
    try {
      if (editing) {
        await AdminService.updateRoute(editing._id || editing.route_id, form)
        notify.success('Cập nhật thành công')
      } else {
        await AdminService.createRoute(form)
        notify.success('Tạo tuyến đường thành công')
      }
      setOpen(false)
      setEditing(null)
      fetchData()
    } catch (error) {
      notify.error(error.response?.data?.msg || 'Có lỗi xảy ra')
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Pagination
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Stats
  const totalStops = rows.reduce((sum, r) => sum + (r.stops?.length || 0), 0)

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            🛣️ Quản lý tuyến đường
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip
              icon={<RouteIcon />}
              label={`${rows.length} tuyến`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<PlaceIcon />}
              label={`${totalStops} trạm dừng`}
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
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }
            }}
          >
            Thêm tuyến
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
                  <TableCell width={50}></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên tuyến</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Lộ trình</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Số trạm</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Khoảng cách</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((route, index) => (
                    <React.Fragment key={route._id || route.route_id || index}>
                      <TableRow hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(route._id)}
                            sx={{
                              transition: 'transform 0.2s',
                              transform: expandedId === route._id ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: '#06b6d4', width: 40, height: 40 }}>
                              <RouteIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>{route.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {(route._id || route.route_id)?.slice(-6)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={route.start || route.stops?.[0]?.name || '—'}
                              size="small"
                              sx={{ bgcolor: '#dcfce7', color: '#166534', maxWidth: 150 }}
                            />
                            <ArrowForwardIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                            <Chip
                              label={route.end || route.stops?.[route.stops?.length - 1]?.name || '—'}
                              size="small"
                              sx={{ bgcolor: '#fee2e2', color: '#dc2626', maxWidth: 150 }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={<PlaceIcon />}
                            label={`${route.stops?.length || 0} trạm`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <StraightenIcon sx={{ color: '#6366f1', fontSize: 18 }} />
                            <Typography variant="body2" fontWeight={500}>
                              {route.distance || '—'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <AccessTimeIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                            <Typography variant="body2" fontWeight={500}>
                              {route.duration || '—'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                sx={{ color: '#f59e0b', '&:hover': { bgcolor: '#fef3c7' } }}
                                onClick={() => onEdit(route)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                                onClick={() => onDelete(route)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row - Chi tiết các trạm */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                          <Collapse in={expandedId === route._id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, my: 1, mx: 2 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: '#475569' }}>
                                📍 Chi tiết các trạm dừng ({route.stops?.length || 0} trạm)
                              </Typography>

                              {route.stops && route.stops.length > 0 ? (
                                <Stack spacing={1}>
                                  {route.stops.map((stop, idx) => {
                                    const isFirst = idx === 0
                                    const isLast = idx === route.stops.length - 1

                                    return (
                                      <Stack
                                        key={stop._id || stop.stop_id || idx}
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                        sx={{
                                          p: 1.5,
                                          bgcolor: 'white',
                                          borderRadius: 1.5,
                                          border: '1px solid #e2e8f0'
                                        }}
                                      >
                                        <Chip
                                          label={idx + 1}
                                          size="small"
                                          sx={{
                                            bgcolor: isFirst ? '#22c55e' : isLast ? '#ef4444' : '#6366f1',
                                            color: 'white',
                                            fontWeight: 700,
                                            minWidth: 32
                                          }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                          <Typography fontWeight={500}>{stop.name}</Typography>
                                          {stop.address?.fullAddress && (
                                            <Typography variant="caption" color="text.secondary">
                                              {stop.address.fullAddress}
                                            </Typography>
                                          )}
                                        </Box>
                                        <Chip
                                          label={isFirst ? 'Xuất phát' : isLast ? 'Điểm đích' : 'Trung gian'}
                                          size="small"
                                          variant="outlined"
                                          sx={{
                                            borderColor: isFirst ? '#22c55e' : isLast ? '#ef4444' : '#6366f1',
                                            color: isFirst ? '#22c55e' : isLast ? '#ef4444' : '#6366f1'
                                          }}
                                        />
                                      </Stack>
                                    )
                                  })}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                  Chưa có trạm nào được thêm vào tuyến này
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <RouteIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                      <Typography color="text.secondary">Chưa có tuyến đường nào</Typography>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={onAdd}
                        sx={{ mt: 2 }}
                        variant="outlined"
                      >
                        Tạo tuyến đường đầu tiên
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

      {/* Dialogs */}
      <RouteFormDialog
        open={open}
        onClose={() => setOpen(false)}
        initialValue={editing}
        onSubmit={onSubmit}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Xóa tuyến đường"
        message={`Bạn có chắc muốn xóa tuyến "${confirm.row?.name}"? Các lịch trình sử dụng tuyến này có thể bị ảnh hưởng. `}
        cancelText="Hủy"
        okText="Xóa"
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </Box>
  )
}