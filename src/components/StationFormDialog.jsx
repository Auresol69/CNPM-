import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogActions, Button, TextField, Stack, Box, Typography, Alert } from "@mui/material"
import PlaceIcon from '@mui/icons-material/Place'

export default function StationFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({ 
    name: '', 
    fullAddress: '', 
    district: '', 
    city: '', 
    latitude: '', 
    longitude: '' 
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialValue) {
      // Backend:  address. location.coordinates = [longitude, latitude]
      const coords = initialValue.address?. location?.coordinates || []
      setForm({
        name: initialValue.name || '',
        fullAddress: initialValue. address?.fullAddress || initialValue.fullAddress || '',
        district: initialValue. address?.district || initialValue.district || '',
        city: initialValue.address?.city || initialValue.city || 'TP. HCM',
        // FIX:  coords[0] = longitude, coords[1] = latitude
        latitude: (initialValue.latitude ??  coords[1] ?? '').toString(),
        longitude:  (initialValue.longitude ?? coords[0] ?? '').toString()
      })
    } else {
      setForm({ 
        name: '', 
        fullAddress: '', 
        district: '', 
        city: 'TP.HCM', 
        latitude: '', 
        longitude: '' 
      })
    }
    setError('')
    setSubmitting(false)
  }, [initialValue, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.name. trim()) {
      setError('Vui lòng nhập tên trạm')
      return
    }
    if (!form.fullAddress. trim()) {
      setError('Vui lòng nhập địa chỉ')
      return
    }
    if (!form.latitude. trim() || !form.longitude.trim()) {
      setError('Vui lòng nhập tọa độ (latitude, longitude)')
      return
    }
    
    // Parse và validate số
    const latStr = form.latitude. trim().replace(',', '.')
    const lngStr = form. longitude.trim().replace(',', '.')
    
    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)
    
    if (isNaN(lat)) {
      setError('Vĩ độ (Latitude) không hợp lệ.  Vui lòng nhập số (VD: 10.7769)')
      return
    }
    
    if (isNaN(lng)) {
      setError('Kinh độ (Longitude) không hợp lệ. Vui lòng nhập số (VD: 106.7009)')
      return
    }
    
    if (lat < -90 || lat > 90) {
      setError('Vĩ độ (Latitude) phải từ -90 đến 90')
      return
    }
    
    if (lng < -180 || lng > 180) {
      setError('Kinh độ (Longitude) phải từ -180 đến 180')
      return
    }
    
    setSubmitting(true)
    
    try {
      await onSubmit({
        name:  form.name. trim(),
        address: form.fullAddress.trim(),
        fullAddress: form.fullAddress.trim(),
        district: form. district.trim(),
        city: form. city.trim() || 'TP.HCM',
        latitude: lat,
        longitude: lng
      })
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Có lỗi xảy ra')
      setSubmitting(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box sx={{ 
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
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
          mb: 2, 
          display:  'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
        }}>
          <PlaceIcon sx={{ fontSize: 45, color: '#8b5cf6' }} />
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
          {initialValue ? '✏️ Sửa thông tin trạm' : '📍 Thêm trạm mới'}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        <Stack spacing={2.5}>
          <TextField 
            label="Tên trạm *" 
            name="name" 
            value={form. name} 
            onChange={handleChange} 
            fullWidth 
            placeholder="VD: Trường THPT Nguyễn Huệ"
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          
          <TextField 
            label="Địa chỉ đầy đủ *" 
            name="fullAddress" 
            value={form.fullAddress} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            rows={2} 
            placeholder="VD: 123 Lê Lợi, Phường Bến Nghé, Quận 1"
            InputProps={{ sx: { borderRadius: 2 } }}
          />
          
          <Stack direction="row" spacing={2}>
            <TextField 
              label="Quận/Huyện" 
              name="district" 
              value={form.district} 
              onChange={handleChange} 
              fullWidth 
              placeholder="VD:  Quận 1"
              InputProps={{ sx: { borderRadius: 2 } }} 
            />
            <TextField 
              label="Thành phố" 
              name="city" 
              value={form.city} 
              onChange={handleChange} 
              fullWidth 
              placeholder="TP.HCM"
              InputProps={{ sx: { borderRadius: 2 } }} 
            />
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <TextField 
              label="Vĩ độ (Latitude) *" 
              name="latitude" 
              value={form.latitude} 
              onChange={handleChange} 
              fullWidth 
              placeholder="10.7769"
              helperText="VD: 10.7769 (từ -90 đến 90)"
              InputProps={{ sx: { borderRadius:  2 } }}
            />
            <TextField 
              label="Kinh độ (Longitude) *" 
              name="longitude" 
              value={form.longitude} 
              onChange={handleChange} 
              fullWidth 
              placeholder="106.7009"
              helperText="VD: 106.7009 (từ -180 đến 180)"
              InputProps={{ sx: { borderRadius:  2 } }}
            />
          </Stack>
          
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            💡 <strong>Mẹo:</strong> Mở Google Maps, click chuột phải vào vị trí cần lấy tọa độ, 
            rồi copy 2 số hiện ra (số đầu là Latitude, số sau là Longitude).
          </Alert>
        </Stack>
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
          disabled={submitting}
          sx={{ 
            borderRadius:  2, 
            px: 3, 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
            }
          }}
        >
          {submitting ? 'Đang xử lý...' : (initialValue ? 'Cập nhật' : 'Thêm trạm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}