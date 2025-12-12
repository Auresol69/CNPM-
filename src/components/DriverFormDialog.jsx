import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogActions, Button, TextField, Stack, Box, Typography, Avatar, Alert, InputAdornment } from "@mui/material"
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import avatarDriver from '../assets/driver.png'

export default function DriverFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({ name: '', phoneNumber: '', email: '', password: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || '',
        phoneNumber: initialValue.phoneNumber || initialValue.phone_number || '',
        email: initialValue.email || '',
        password: ''
      })
    } else {
      setForm({ name: '', phoneNumber: '', email: '', password: '' })
    }
    setError('')
  }, [initialValue, open])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phoneNumber) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email không hợp lệ')
      return
    }
    if (!/^0\d{9}$/.test(form.phoneNumber)) {
      setError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)')
      return
    }
    onSubmit({
      name: form.name,
      phoneNumber: form.phoneNumber,
      email: form.email,
      password: form.password || 'Driver123'
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', pt: 3, pb: 2, px: 3, textAlign: 'center' }}>
        <Avatar src={avatarDriver} sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
          {initialValue ? '✏️ Sửa thông tin tài xế' : '🚗 Thêm tài xế mới'}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        
        <Stack spacing={2.5}>
          <TextField label="Họ tên *" name="name" value={form.name} onChange={handleChange} fullWidth 
            InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }} />
          <Stack direction="row" spacing={2}>
            <TextField label="Số điện thoại *" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} fullWidth placeholder="0901234567"
              InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }} />
            <TextField label="Email *" name="email" type="email" value={form.email} onChange={handleChange} fullWidth placeholder="driver@example.com"
              InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }} />
          </Stack>
          {!initialValue && (
            <TextField label="Mật khẩu" name="password" type="password" value={form.password} onChange={handleChange} fullWidth placeholder="Để trống sẽ dùng: Driver123" helperText="Mặc định: Driver123"
              InputProps={{ sx: { borderRadius: 2 }, startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }} />
          )}
          <Alert severity="info" sx={{ borderRadius: 2 }}>Tài xế sẽ dùng email hoặc số điện thoại để đăng nhập. </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, px: 3 }}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          {initialValue ? 'Cập nhật' : 'Thêm tài xế'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}