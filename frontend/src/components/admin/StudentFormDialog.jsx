import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Box, Typography, Avatar, CircularProgress, Alert } from "@mui/material"
import { AdminService } from '../../services/admin/AdminService'
import avatarTrai from '../../assets/avatar_trai.png'

export default function StudentFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({ name: '', grade: '', parentId: '', fullAddress: '', latitude: '', longitude: '' })
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setLoading(true)
      AdminService.listParents()
        .then(setParents)
        .catch(err => setError('Không thể tải danh sách phụ huynh'))
        .finally(() => setLoading(false))
    }
  }, [open])

  useEffect(() => {
    if (initialValue) {
      setForm({
        name: initialValue.name || '',
        grade: initialValue.grade || initialValue.class || '',
        parentId: initialValue.parentId?._id || initialValue.parentId || initialValue.parent_id || '',
        fullAddress: initialValue.fullAddress || '',
        latitude: initialValue.location?.coordinates?.[1] || '',
        longitude: initialValue.location?.coordinates?.[0] || ''
      })
    } else {
      setForm({ name: '', grade: '', parentId: '', fullAddress: '', latitude: '', longitude: '' })
    }
    setError('')
  }, [initialValue, open])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = () => {
    if (!form.name || !form.grade) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    onSubmit({
      name: form.name,
      grade: form.grade,
      parentId: form.parentId || undefined,
      fullAddress: form.fullAddress || 'Chưa cập nhật',
      latitude: form.latitude,
      longitude: form.longitude
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', pt: 3, pb: 2, px: 3, textAlign: 'center' }}>
        <Avatar src={avatarTrai} sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
          {initialValue ? '✏️ Sửa thông tin học sinh' : '🎒 Thêm học sinh mới'}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={2.5}>
            <TextField label="Họ tên học sinh *" name="name" value={form.name} onChange={handleChange} fullWidth InputProps={{ sx: { borderRadius: 2 } }} />
            <Stack direction="row" spacing={2}>
              <TextField label="Lớp *" name="grade" value={form.grade} onChange={handleChange} fullWidth placeholder="VD: Lớp 5A" InputProps={{ sx: { borderRadius: 2 } }} />
              <TextField select label="Phụ huynh" name="parentId" value={form.parentId} onChange={handleChange} fullWidth InputProps={{ sx: { borderRadius: 2 } }}>
                <MenuItem value=""><em>-- Chọn phụ huynh --</em></MenuItem>
                {parents.map((p) => <MenuItem key={p._id} value={p._id}>{p.name} - {p.phoneNumber}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField label="Địa chỉ" name="fullAddress" value={form.fullAddress} onChange={handleChange} fullWidth multiline rows={2} InputProps={{ sx: { borderRadius: 2 } }} />
            <Stack direction="row" spacing={2}>
              <TextField label="Vĩ độ" name="latitude" type="number" value={form.latitude} onChange={handleChange} fullWidth placeholder="10.7725" InputProps={{ sx: { borderRadius: 2 } }} />
              <TextField label="Kinh độ" name="longitude" type="number" value={form.longitude} onChange={handleChange} fullWidth placeholder="106.6942" InputProps={{ sx: { borderRadius: 2 } }} />
            </Stack>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, px: 3 }}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
          {initialValue ? 'Cập nhật' : 'Thêm học sinh'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}