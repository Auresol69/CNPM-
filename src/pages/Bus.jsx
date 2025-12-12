import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, IconButton, Stack, Tooltip, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import { AdminService } from '../api/services'
import BusFormDialog from '../components/BusFormDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotify } from '../hooks/useNotify'

export default function Buses() {
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
      const data = await AdminService.listBuses()
      console.log('Buses data:', data)
      setRows(data || [])
    } catch (err) {
      console. error('Error:', err)
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
  const onDelete = (row) => { setConfirm({ open: true, row }) }

  const confirmDelete = async () => {
    try {
      if (confirm.row) {
        await AdminService. deleteBus(confirm. row._id || confirm.row.bus_id)
        notify.success('Xóa thành công')
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
        await AdminService. updateBus(editing._id || editing. bus_id, form)
        notify. success('Cập nhật thành công') 
      } else { 
        await AdminService. createBus(form)
        notify. success('Tạo thành công') 
      }
      setOpen(false)
      setEditing(null)
      fetchData()
    } catch (error) {
      notify.error(error. response?.data?.msg || 'Có lỗi xảy ra')
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Danh sách xe buýt
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Quản lý thông tin xe ({rows.length} xe)
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
            sx={{ borderRadius: 2, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
          >
            Thêm xe
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 2 }}>
          Lỗi: {error}
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Biển số xe</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>API Key (GPS)</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows. length > 0 ? (
                rows.map((row, index) => (
                  <TableRow key={row._id || row.bus_id || index} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <DirectionsBusIcon sx={{ color: '#ef4444' }} />
                        <Typography fontWeight={600}>{row.licensePlate || row. plate_number}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={row.isAssigned ?  'Đã gán lịch' : 'Chưa gán'} 
                        color={row.isAssigned ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0. 8rem', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                        {row.apiKey || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Sửa">
                          <IconButton size="small" sx={{ color: '#f59e0b' }} onClick={() => onEdit(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => onDelete(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có dữ liệu xe</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <BusFormDialog open={open} onClose={() => setOpen(false)} initialValue={editing} onSubmit={onSubmit} />
      <ConfirmDialog
        open={confirm. open}
        title="Xóa xe"
        message={`Bạn có chắc muốn xóa xe "${confirm.row?.licensePlate || confirm. row?.plate_number}"?`}
        cancelText="Hủy"
        okText="Xóa"
        onCancel={() => setConfirm({ open: false, row: null })}
        onOk={confirmDelete}
      />
    </Box>
  )
}