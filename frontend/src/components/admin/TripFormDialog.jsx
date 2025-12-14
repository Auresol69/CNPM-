import React, { useEffect, useState } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from "@mui/material"
import { routes, buses } from "../api/mockData"

const statuses = [
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "IN_PROGRESS", label: "Đang chạy" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
]

export default function TripFormDialog({ open, onClose, initialValue, onSubmit }) {
  const [form, setForm] = useState({ route_id: '', bus_id: '', start_time: '', end_time: '', status: 'SCHEDULED' })

  useEffect(() => {
    if (initialValue) {
      setForm({
        route_id: initialValue.route_id || '',
        bus_id: initialValue.bus_id || '',
        start_time: initialValue.start_time?.slice(0, 16) || '',
        end_time: initialValue.end_time?.slice(0, 16) || '',
        status: initialValue.status || 'SCHEDULED',
      })
    } else {
      setForm({ route_id: '', bus_id: '', start_time: '', end_time: '', status: 'SCHEDULED' })
    }
  }, [initialValue, open])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValue ? 'Sửa chuyến' : 'Thêm chuyến'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Tuyến đường" name="route_id" value={form.route_id} onChange={handleChange} fullWidth>
            {routes.map((r) => <MenuItem key={r.route_id} value={r.route_id}>{r.name}</MenuItem>)}
          </TextField>
          <TextField select label="Xe" name="bus_id" value={form.bus_id} onChange={handleChange} fullWidth>
            {buses.map((b) => <MenuItem key={b.bus_id} value={b.bus_id}>{b.plate_number}</MenuItem>)}
          </TextField>
          <TextField label="Giờ bắt đầu" name="start_time" type="datetime-local" value={form.start_time} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Giờ kết thúc" name="end_time" type="datetime-local" value={form.end_time} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField select label="Trạng thái" name="status" value={form.status} onChange={handleChange} fullWidth>
            {statuses.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSubmit(form)}>Lưu</Button>
      </DialogActions>
    </Dialog>
  )
}
