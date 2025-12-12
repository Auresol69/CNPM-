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
import SchoolIcon from '@mui/icons-material/School'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import SearchIcon from '@mui/icons-material/Search'
import FaceIcon from '@mui/icons-material/Face'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import { AdminService } from '../api/services'
import StudentFormDialog from '../components/StudentFormDialog'
import FaceUploadDialog from '../components/FaceUploadDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotify } from '../hooks/useNotify'

export default function Students() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Dialog states
  const [openForm, setOpenForm] = useState(false)
  const [openFaceDialog, setOpenFaceDialog] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedStudentForFace, setSelectedStudentForFace] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null })

  const notify = useNotify()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await AdminService. listStudents()
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
  const onUploadFace = (row) => {
    setSelectedStudentForFace(row)
    setOpenFaceDialog(true)
  }

  const confirmDelete = async () => {
    try {
      if (confirm.row) {
        await AdminService.deleteStudent(confirm.row._id || confirm.row.student_id)
        notify.success('Xóa học sinh thành công')
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
        await AdminService. updateStudent(editing._id || editing.student_id, form)
        notify.success('Cập nhật thành công')
      } else {
        await AdminService.createStudent(form)
        notify.success('Thêm học sinh thành công')
      }
      setOpenForm(false)
      setEditing(null)
      fetchData()
    } catch (error) {
      notify.error(error.response?.data?.msg || 'Có lỗi xảy ra')
    }
  }

  // Filter data
  const filteredRows = rows.filter(row =>
    row.name?. toLowerCase().includes(searchTerm.toLowerCase()) ||
    row. grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.fullAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Paginate
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Stats
  const totalStudents = rows.length
  const studentsWithFace = rows.filter(r => r.hasFaceData).length

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            🎒 Quản lý học sinh
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Chip
              icon={<SchoolIcon />}
              label={`${totalStudents} học sinh`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<FaceIcon />}
              label={`${studentsWithFace} đã đăng ký khuôn mặt`}
              color="success"
              variant="outlined"
              size="small"
            />
          </Stack>
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
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }
            }}
          >
            Thêm học sinh
          </Button>
        </Stack>
      </Stack>

      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <TextField
          placeholder="Tìm kiếm theo tên, lớp, địa chỉ..."
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
      {loading ?  (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: 250 }}>Học sinh</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 100 }}>Lớp</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 200 }}>Phụ huynh</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Địa chỉ</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 140 }} align="center">Khuôn mặt</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 150 }} align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows. length > 0 ? (
                  paginatedRows.map((row, index) => (
                    <TableRow
                      key={row._id || row.student_id || index}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={row.avatar}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: '#22c55e',
                              border: row.hasFaceData ? '2px solid #22c55e' : 'none'
                            }}
                          >
                            <SchoolIcon />
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600}>{row. name}</Typography>
                            <Typography variant="caption" color="text. secondary">
                              ID: {(row._id || row.student_id)?.slice(-6)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.grade || row.class || '—'}
                          size="small"
                          sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {row.parent_name || row. parentId?. name || '—'}
                          </Typography>
                          <Typography variant="caption" color="text. secondary">
                            {row.parent_phone || row.parentId?.phoneNumber || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.fullAddress || '—'}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.fullAddress || '—'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        {row.hasFaceData ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Đã đăng ký"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<WarningIcon />}
                            label="Chưa có"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Đăng ký khuôn mặt">
                            <IconButton
                              size="small"
                              onClick={() => onUploadFace(row)}
                              sx={{
                                color: '#6366f1',
                                bgcolor: '#e0e7ff',
                                '&:hover': { bgcolor: '#c7d2fe' }
                              }}
                            >
                              <CameraAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sửa thông tin">
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
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <SchoolIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                      <Typography color="text.secondary">
                        {searchTerm ? 'Không tìm thấy học sinh phù hợp' : 'Chưa có dữ liệu học sinh'}
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
              setRowsPerPage(parseInt(e.target. value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số dòng:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </Paper>
      )}

      {/* Dialogs */}
      <StudentFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        initialValue={editing}
        onSubmit={onSubmit}
      />

      <FaceUploadDialog
        open={openFaceDialog}
        onClose={() => setOpenFaceDialog(false)}
        student={selectedStudentForFace}
        onSuccess={fetchData}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Xóa học sinh"
        message={`Bạn có chắc muốn xóa học sinh "${confirm.row?.name}"?  Hành động này không thể hoàn tác. `}
        cancelText="Hủy"
        okText="Xóa"
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </Box>
  )
}