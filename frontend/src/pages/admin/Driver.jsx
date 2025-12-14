import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, IconButton, Stack, Avatar, Tooltip, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import PersonIcon from '@mui/icons-material/Person'
import { AdminService } from '../../services/admin/AdminService'
import DriverFormDialog from '../../components/admin/DriverFormDialog'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { useNotify } from './hooks/useNotify'

export default function Drivers() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, row: null })
  const notify = useNotify()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await AdminService. listDrivers()
      console.log('Drivers data:', data)
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

  const onAdd = () => { setEditing(null); setOpen(true) }
  const onEdit = (row) => { setEditing(row); setOpen(true) }
  const onDelete = (row) => { setConfirm({ open:  true, row }) }

  const confirmDelete = async () => {
    try {
      if (confirm.row) {
        await AdminService.deleteDriver(confirm.row._id || confirm.row.user_id)
        notify. success('Xóa thành công')
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
        await AdminService.updateDriver(editing._id || editing.user_id, form)
        notify.success('Cập nhật thành công') 
      } else { 
        await AdminService.createDriver(form)
        notify.success('Tạo tài xế thành công') 
      }
      setOpen(false)
      setEditing(null)
      
      // FIX LỖI 2: Đợi backend xử lý xong rồi mới fetch lại
      setTimeout(() => {
        fetchData()
      }, 800)
    } catch (error) {
      console.error('Error creating/updating driver:', error)
      notify.error(error.response?.data?.msg || error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Danh sách tài xế
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Quản lý thông tin tài xế ({rows.length} tài xế)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ borderRadius: 2 }}>
            Làm mới
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={onAdd}
            sx={{ borderRadius: 2, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
          >
            Thêm tài xế
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 2 }}>
          Lỗi:  {error}
        </Paper>
      )}

      {loading ?  (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight:  600 }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight:  600 }} align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={row._id || row.user_id || index} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#f59e0b' }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography fontWeight={500}>{row.name || '—'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.phoneNumber || row.phone_number || '—'}</TableCell>
                    <TableCell>{row.email || '—'}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={row.isActive !== false ? 'Hoạt động' :  'Nghỉ'} 
                        color={row.isActive !== false ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Sửa">
                          <IconButton size="small" sx={{ color: '#f59e0b' }} onClick={() => onEdit(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" sx={{ color:  '#ef4444' }} onClick={() => onDelete(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có dữ liệu tài xế</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DriverFormDialog open={open} onClose={() => setOpen(false)} initialValue={editing} onSubmit={onSubmit} />
      <ConfirmDialog
        open={confirm. open}
        title="Xóa tài xế"
        message={`Bạn có chắc muốn xóa tài xế "${confirm.row?.name}"?`}
        cancelText="Hủy"
        okText="Xóa"
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </Box>
  )
}