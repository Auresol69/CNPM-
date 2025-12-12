import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogActions, Button, TextField, Stack, Box, Typography, Alert, InputAdornment, IconButton, Tooltip } from "@mui/material"
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

export default function BusFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({ licensePlate: '' })
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (initialValue) {
      setForm({ licensePlate: initialValue.licensePlate || initialValue.plate_number || '' })
    } else {
      setForm({ licensePlate: '' })
    }
    setError('')
    setCopied(false)
  }, [initialValue, open])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() })

  const handleSubmit = () => {
    if (!form.licensePlate) {
      setError('Vui lòng nhập biển số xe')
      return
    }
    onSubmit(form)
  }

  const handleCopyApiKey = () => {
    if (initialValue?.apiKey) {
      navigator.clipboard.writeText(initialValue.apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', pt: 3, pb: 2, px: 3, textAlign: 'center' }}>
        <Box sx={{ width: 80, height: 80, bgcolor: 'white', borderRadius: '50%', mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <DirectionsBusIcon sx={{ fontSize: 45, color: '#ef4444' }} />
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
          {initialValue ? '✏️ Sửa thông tin xe' : '🚌 Thêm xe mới'}
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        
        <Stack spacing={2.5}>
          <TextField label="Biển số xe *" name="licensePlate" value={form.licensePlate} onChange={handleChange} fullWidth placeholder="VD: 51B-12345"
            InputProps={{ sx: { borderRadius: 2, fontWeight: 600, fontSize: '1.1rem' }, startAdornment: <InputAdornment position="start"><DirectionsBusIcon sx={{ color: '#9ca3af' }} /></InputAdornment> }} />

          {initialValue?.apiKey && (
            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#166534', mb: 1 }}>🔑 API Key (GPS):</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField value={initialValue.apiKey} fullWidth size="small" InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'white' },
                  endAdornment: <InputAdornment position="end">
                    <Tooltip title={copied ? "Đã copy!" : "Copy"}>
                      <IconButton onClick={handleCopyApiKey} size="small">
                        {copied ? <CheckIcon sx={{ color: '#22c55e' }} /> : <ContentCopyIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                }} />
              </Stack>
            </Box>
          )}

          {initialValue && (
            <Alert severity={initialValue.isAssigned ? "success" : "info"} sx={{ borderRadius: 2 }}>
              <strong>Trạng thái:</strong> {initialValue.isAssigned ? 'Đã được gán lịch trình' : 'Chưa được gán lịch trình'}
            </Alert>
          )}

          {!initialValue && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>Sau khi tạo xe, hệ thống sẽ tự động sinh API Key cho thiết bị GPS.</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, px: 3 }}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2, px: 3, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          {initialValue ? 'Cập nhật' : 'Thêm xe'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}