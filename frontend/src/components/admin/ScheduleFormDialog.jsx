import React, { useEffect, useState } from "react"
import { 
  Dialog, DialogContent, DialogActions, Button, TextField, Stack, Box, 
  Typography, Alert, CircularProgress, MenuItem, FormControl, InputLabel,
  Select, Chip
} from "@mui/material"
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { AdminService } from '../../services/admin/AdminService'

export default function ScheduleFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({
    routeId: '',
    busId: '',
    driverId: '',
    direction: 'PICK_UP',
    daysOfWeek: [1, 2, 3, 4, 5],
    startDate: '',
    endDate: ''
  })
  
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setLoading(true)
      setError('')
      
      Promise.all([
        AdminService.listRoutes(),
        AdminService. listBuses(),
        AdminService.listDrivers()
      ])
        .then(([routesData, busesData, driversData]) => {
          setRoutes(routesData || [])
          setBuses(busesData || [])
          setDrivers(driversData || [])
        })
        .catch((err) => {
          console.error('Error loading data:', err)
          setError('Không thể tải dữ liệu. Vui lòng thử lại.')
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  useEffect(() => {
    if (initialValue) {
      setForm({
        routeId: initialValue.routeId?._id || initialValue.routeId || '',
        busId: initialValue.busId?._id || initialValue.busId || '',
        driverId: initialValue.driverId?._id || initialValue.driverId || '',
        direction:  initialValue.direction || 'PICK_UP',
        daysOfWeek:  initialValue.daysOfWeek || [1, 2, 3, 4, 5],
        startDate: initialValue.startDate?. split('T')[0] || '',
        endDate: initialValue. endDate?.split('T')[0] || ''
      })
    } else {
      const today = new Date()
      const threeMonthsLater = new Date()
      threeMonthsLater. setMonth(threeMonthsLater.getMonth() + 3)
      
      setForm({
        routeId: '',
        busId: '',
        driverId: '',
        direction: 'PICK_UP',
        daysOfWeek: [1, 2, 3, 4, 5],
        startDate: today.toISOString().split('T')[0],
        endDate: threeMonthsLater. toISOString().split('T')[0]
      })
    }
    setError('')
    setSubmitting(false)
  }, [initialValue, open])

  const handleDayChange = (day) => {
    const newDays = form.daysOfWeek.includes(day)
      ? form.daysOfWeek.filter(d => d !== day)
      : [...form.daysOfWeek, day]. sort((a, b) => a - b)
    setForm({ ...form, daysOfWeek: newDays })
  }

  const handleSubmit = async () => {
    if (!form. routeId) {
      setError('Vui lòng chọn tuyến đường')
      return
    }
    if (!form. busId) {
      setError('Vui lòng chọn xe buýt')
      return
    }
    if (!form. driverId) {
      setError('Vui lòng chọn tài xế')
      return
    }
    if (form. daysOfWeek. length === 0) {
      setError('Vui lòng chọn ít nhất một ngày hoạt động')
      return
    }
    if (! form.startDate || !form.endDate) {
      setError('Vui lòng chọn ngày bắt đầu và kết thúc')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      await onSubmit({
        routeId:  form.routeId,
        busId: form.busId,
        driverId: form. driverId,
        direction: form.direction,
        daysOfWeek: form.daysOfWeek,
        startDate: form.startDate,
        endDate: form.endDate
      })
    } catch (err) {
      console.error('Error submitting schedule:', err)
      setError(err. response?.data?.msg || err.response?.data?.message || err.message || 'Có lỗi xảy ra')
      setSubmitting(false)
    }
  }

  const dayLabels = [
    { value:  1, label:  'T2' },
    { value: 2, label: 'T3' },
    { value: 3, label: 'T4' },
    { value: 4, label: 'T5' },
    { value:  5, label:  'T6' },
    { value: 6, label: 'T7' },
    { value: 7, label: 'CN' }
  ]

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ sx:  { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box sx={{ 
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', 
        pt: 3, 
        pb: 2, 
        px: 3, 
        textAlign: 'center' 
      }}>
        <Box sx={{ 
          width: 80, 
          height: 80, 
          bgcolor: 'white', 
          borderRadius: '50%', 
          mx: 'auto', 
          mb:  2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
        }}>
          <CalendarMonthIcon sx={{ fontSize: 45, color: '#ec4899' }} />
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ color:  'white' }}>
          {initialValue ? '✏️ Sửa lịch trình' : '📅 Thêm lịch trình mới'}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius:  2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display:  'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel>Tuyến đường *</InputLabel>
              <Select
                value={form.routeId}
                label="Tuyến đường *"
                onChange={(e) => setForm({ ...form, routeId: e. target.value })}
                sx={{ borderRadius: 2 }}
              >
                {routes.length === 0 ? (
                  <MenuItem disabled>Không có tuyến đường nào</MenuItem>
                ) : (
                  routes.map(route => (
                    <MenuItem key={route._id || route.route_id} value={route._id || route.route_id}>
                      {route.name} {route.distance ?  `(${route.distance})` : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Xe buýt *</InputLabel>
                <Select
                  value={form.busId}
                  label="Xe buýt *"
                  onChange={(e) => setForm({ ...form, busId: e. target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  {buses.length === 0 ? (
                    <MenuItem disabled>Không có xe nào</MenuItem>
                  ) : (
                    buses. map(bus => (
                      <MenuItem key={bus._id || bus.bus_id} value={bus._id || bus. bus_id}>
                        {bus. licensePlate || bus. plate_number}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Tài xế *</InputLabel>
                <Select
                  value={form. driverId}
                  label="Tài xế *"
                  onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  {drivers.length === 0 ? (
                    <MenuItem disabled>Không có tài xế nào</MenuItem>
                  ) : (
                    drivers.map(driver => (
                      <MenuItem key={driver._id || driver.user_id} value={driver._id || driver.user_id}>
                        {driver.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Loại lịch trình</InputLabel>
              <Select
                value={form.direction}
                label="Loại lịch trình"
                onChange={(e) => setForm({ ...form, direction: e. target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="PICK_UP">🔼 Đón học sinh (buổi sáng đi học)</MenuItem>
                <MenuItem value="DROP_OFF">🔽 Trả học sinh (buổi chiều về nhà)</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Ngày hoạt động trong tuần *
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {dayLabels.map(day => (
                  <Chip
                    key={day.value}
                    label={day.label}
                    onClick={() => handleDayChange(day.value)}
                    color={form.daysOfWeek.includes(day.value) ? 'primary' : 'default'}
                    variant={form.daysOfWeek.includes(day.value) ? 'filled' : 'outlined'}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: form.daysOfWeek.includes(day.value) ? 600 : 400
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Ngày bắt đầu *"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e. target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Ngày kết thúc *"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e. target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Stack>

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              💡 Sau khi tạo lịch trình, bạn có thể vào <strong>Chi tiết</strong> để gán học sinh vào từng trạm dừng.
            </Alert>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          sx={{ borderRadius: 2, px: 3 }}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading || submitting}
          sx={{ 
            borderRadius: 2, 
            px: 3, 
            background:  'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            '&:hover':  {
              background:  'linear-gradient(135deg, #db2777 0%, #be185d 100%)'
            }
          }}
        >
          {submitting ?  'Đang xử lý...' : (initialValue ? 'Cập nhật' : 'Tạo lịch trình')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}