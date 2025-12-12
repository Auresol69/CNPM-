import React, { useEffect, useState } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material"

export default function StopFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({ name: '', address: '', latitude: '', longitude: '', seq_index: 1 })

  useEffect(() => {
    if (initialValue) setForm(initialValue)
    else setForm({ name: '', address: '', latitude: '', longitude: '', seq_index: 1 })
  }, [initialValue, open])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValue?.stop_id ? 'Sửa điểm dừng' : 'Thêm điểm dừng'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tên điểm dừng" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField label="Địa chỉ" name="address" value={form.address} onChange={handleChange} fullWidth />
          <TextField label="Vĩ độ" name="latitude" type="number" value={form.latitude} onChange={handleChange} fullWidth />
          <TextField label="Kinh độ" name="longitude" type="number" value={form.longitude} onChange={handleChange} fullWidth />
          <TextField label="Thứ tự" name="seq_index" type="number" value={form.seq_index} onChange={handleChange} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSubmit({ ...form, route_id: initialValue?.route_id })}>Lưu</Button>
      </DialogActions>
    </Dialog>
  )
}
