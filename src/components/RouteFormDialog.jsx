import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogActions, Button, TextField, Stack, Box, Typography, Alert, Chip, Autocomplete, CircularProgress } from "@mui/material"
import RouteIcon from '@mui/icons-material/AltRoute'
import { AdminService } from '../api/services'

export default function RouteFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({ name: '', stationIds: [] })
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setLoading(true)
      AdminService.listStations()
        .then(setStations)
        .catch(() => setError('Không thể tải danh sách trạm'))
        .finally(() => setLoading(false))
    }
  }, [open])

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || '',
        stationIds: initialValue.stops?.map(s => s._id || s.stop_id) || initialValue.orderedStops?.map(s => s._id) || []
      })
    } else {
      setForm({ name: '', stationIds: [] })
    }
    setError('')
  }, [initialValue, open])

  const handleSubmit = () => {
    if (!form.name) {
      setError('Vui lòng nhập tên tuyến đường')
      return
    }
    if (form.stationIds.length < 2) {
      setError('Vui lòng chọn ít nhất 2 trạm dừng')
      return
    }
    onSubmit({
      name: form.name,
      stationIds: form.stationIds
    })
  }

  const selectedStations = stations.filter(s => form.stationIds.includes(s._id || s.station_id))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', pt: 3, pb: 2, px: 3, textAlign: 'center' }}>
        <Box sx={{ width: 80, height: 80, bgcolor: 'white', borderRadius: '50%', mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <RouteIcon sx={{ fontSize: 45, color: '#06b6d4' }} />
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
          {initialValue ? '✏️ Sửa tuyến đường' : '🛣️ Thêm tuyến mới'}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={2.5}>
            <TextField label="Tên tuyến đường *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth placeholder="VD: Tuyến 01 - Quận 1 - Quận 7" InputProps={{ sx: { borderRadius: 2 } }} />
            
            <Autocomplete
              multiple
              options={stations}
              getOptionLabel={(option) => option.name || ''}
              value={selectedStations}
              onChange={(e, newValue) => setForm({ ...form, stationIds: newValue.map(s => s._id || s.station_id) })}
              renderInput={(params) => <TextField {...params} label="Chọn các trạm dừng *" placeholder="Chọn theo thứ tự tuyến đường" />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={`${index + 1}. ${option.name}`} {...getTagProps({ index })} size="small" sx={{ m: 0.5 }} />
                ))
              }
            />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Chọn các trạm theo đúng thứ tự tuyến đường. Backend sẽ tự động tính khoảng cách và thời gian.
            </Alert>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, px: 3 }}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
          {initialValue ? 'Cập nhật' : 'Tạo tuyến'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}