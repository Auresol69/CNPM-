import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, CircularProgress, IconButton, Stack,
  Avatar, Tooltip, Chip, TextField, InputAdornment, TablePagination
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import PlaceIcon from '@mui/icons-material/Place'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MapIcon from '@mui/icons-material/Map'
import { AdminService } from '../../services/admin/AdminService'
import StationFormDialog from '../../components/admin/StationFormDialog'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { useNotify } from './hooks/useNotify'

export default function Stations() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Dialog states
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null })

  const notify = useNotify()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await AdminService.listStations()
      console.log('Stations data:', data)
      setRows(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handlers
  const onAdd = () => { setEditing(null); setOpenForm(true) }
  const onEdit = (row) => { setEditing(row); setOpenForm(true) }
  const onDelete = (row) => { setConfirm({ open: true, row }) }

  const confirmDelete = async () => {
    try {
      if (confirm.row) {
        await AdminService.deleteStation(confirm.row._id)
        notify.success('Xóa trạm thành công')
        fetchData()
      }
    } catch {
      notify.error('Có lỗi xảy ra khi xóa')
    }
    setConfirm({ open: false, row: null })
  }

  const onSubmit = async (form) => {
    try {
      if (editing) {
        await AdminService.updateStation(editing._id, form)
        notify.success('Cập nhật thành công')
      } else {
        await AdminService.createStation(form)
        notify.success('Thêm trạm thành công')
      }
      setOpenForm(false)
      setEditing(null)
      fetchData()
    } catch (error) {
      notify.error(error.response?.data?.msg || 'Có lỗi xảy ra')
    }
  }

  // Filter data
  const filteredRows = rows.filter(row => {
    const name = row.name?.toLowerCase() || ''
    const address = row.address?.fullAddress?.toLowerCase() || ''
    const district = row.address?.district?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return name.includes(search) || address.includes(search) || district.includes(search)
  })

  // Paginate
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            📍 Quản lý trạm dừng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quản lý các trạm đón/trả học sinh ({rows.length} trạm)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ borderRadius: 2 }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }
            }}
          >
            Thêm trạm
          </Button>
        </Stack>
      </Stack>

      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <TextField
          placeholder="Tìm kiếm theo tên, địa chỉ, quận..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2 }
          }}
        />
      </Paper>

      {/* Error message */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 2 }}>
          Lỗi: {error}
        </Paper>
      )}

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
                  <TableCell sx={{ fontWeight: 600, width: 250 }}>Tên trạm</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Địa chỉ</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 120 }}>Quận/Huyện</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 150 }} align="center">Tọa độ</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 120 }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, index) => (
                    <TableRow
                      key={row._id || index}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: '#8b5cf6'
                            }}
                          >
                            <PlaceIcon />
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>{row.name || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {row._id?.slice(-6) || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.address?.fullAddress || '—'}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.address?.fullAddress || row.address?.street || '—'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.address?.district || row.address?.city || '—'}
                          size="small"
                          sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {row.address?.latitude && row.address?.longitude ? (
                          <Tooltip title={`${row.address.latitude}, ${row.address.longitude}`}>
                            <Chip
                              icon={<LocationOnIcon />}
                              label="Xem"
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => {
                                window.open(
                                  `https://www.google.com/maps? q=${row.address.latitude},${row.address.longitude}`,
                                  '_blank'
                                )
                              }}
                              sx={{ cursor: 'pointer' }}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Sửa">
                            <IconButton
                              size="small"
                              sx={{ color: '#f59e0b', '&:hover': { bgcolor: '#fef3c7' } }}
                              onClick={() => onEdit(row)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                              onClick={() => onDelete(row)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <PlaceIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                      <Typography color="text.secondary">
                        {searchTerm ? 'Không tìm thấy trạm phù hợp' : 'Chưa có dữ liệu trạm dừng'}
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

      {/* Dialogs */}
      {openForm && (
        <StationFormDialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          initialValue={editing}
          onSubmit={onSubmit}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Xóa trạm dừng"
        message={`Bạn có chắc muốn xóa trạm "${confirm.row?.name}"? Hành động này không thể hoàn tác.`}
        cancelText="Hủy"
        okText="Xóa"
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </Box>
  )
}