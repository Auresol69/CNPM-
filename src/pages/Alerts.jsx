import React, { useEffect, useState } from 'react'
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, CircularProgress, Stack, Chip, TablePagination 
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningIcon from '@mui/icons-material/Warning'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import { AdminService } from '../api/services'

export default function Alerts() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await AdminService. listAlerts()
      console.log('Alerts data:', data)
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

  // Helper:  Lấy biển số xe - Backend populate busId thành object
  const getBusPlate = (row) => {
    // Backend Alert model:  busId là ref đến Bus, đã populate
    if (row.busId && typeof row.busId === 'object') {
      return row. busId. licensePlate || null
    }
    // Fallback nếu đã map sẵn
    return row.bus_plate || null
  }

  // Helper: Format thời gian - Backend dùng 'timestamp'
  const formatTime = (row) => {
    // Backend Alert model: field là 'timestamp', không phải 'createdAt'
    const timestamp = row.timestamp || row.createdAt || row.created_at
    
    if (!timestamp) return null
    
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return null
      
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return null
    }
  }

  // Helper: Config cho loại alert - Backend enum:  SOS, LATE, OFF_ROUTE, SPEEDING, OTHER
  const getAlertTypeConfig = (type) => {
    const typeStr = (type || '').toUpperCase()
    
    const configs = {
      'SOS': { color: 'error', icon: <ErrorIcon />, label:  'SOS' },
      'LATE': { color:  'warning', icon: <WarningIcon />, label:  'LATE' },
      'OFF_ROUTE': { color: 'warning', icon: <WarningIcon />, label: 'OFF_ROUTE' },
      'SPEEDING': { color:  'error', icon: <WarningIcon />, label: 'SPEEDING' },
      'OTHER': { color: 'default', icon: <InfoIcon />, label:  'OTHER' }
    }
    
    return configs[typeStr] || { color: 'default', icon: <WarningIcon />, label: type || 'Khác' }
  }

  // Paginate data
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            ⚠️ Cảnh báo hệ thống
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Theo dõi các sự cố và cảnh báo ({rows.length} cảnh báo)
          </Typography>
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

      {/* Error message */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 2 }}>
          Lỗi: {error}
        </Paper>
      )}

      {/* Loading */}
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
                  <TableCell sx={{ fontWeight: 600, width: 140 }}>Loại</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nội dung</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 140 }}>Xe</TableCell>
                  <TableCell sx={{ fontWeight:  600, width: 180 }}>Thời gian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, index) => {
                    const alertConfig = getAlertTypeConfig(row.type)
                    const busPlate = getBusPlate(row)
                    const formattedTime = formatTime(row)
                    
                    return (
                      <TableRow key={row._id || row.alert_id || index} hover>
                        {/* Loại cảnh báo */}
                        <TableCell>
                          <Chip 
                            icon={alertConfig.icon}
                            size="small" 
                            label={alertConfig.label} 
                            color={alertConfig.color}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        
                        {/* Nội dung - Backend field là 'message' */}
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#334155',
                              maxWidth: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.message || '—'}
                          </Typography>
                        </TableCell>
                        
                        {/* Xe */}
                        <TableCell>
                          {busPlate ?  (
                            <Chip
                              icon={<DirectionsBusIcon />}
                              label={busPlate}
                              size="small"
                              sx={{ 
                                bgcolor: '#fef3c7', 
                                color: '#92400e', 
                                fontWeight: 600,
                                '& .MuiChip-icon':  { color: '#92400e' }
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        
                        {/* Thời gian */}
                        <TableCell>
                          {formattedTime ?  (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <AccessTimeIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                              <Typography variant="body2" color="text.secondary">
                                {formattedTime}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <WarningIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                      <Typography color="text.secondary">Không có cảnh báo nào</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {rows.length > 0 && (
            <TablePagination
              component="div"
              count={rows.length}
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
          )}
        </Paper>
      )}
    </Box>
  )
}