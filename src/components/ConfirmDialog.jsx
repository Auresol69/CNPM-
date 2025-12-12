import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

export default function ConfirmDialog({ open, title, message, cancelText = 'Hủy', okText = 'Xác nhận', onCancel, onOk }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <Box sx={{ width: 60, height: 60, bgcolor: '#fef3c7', borderRadius: '50%', mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WarningAmberIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
        </Box>
        <Typography variant="h6" fontWeight="bold">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography textAlign="center" color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button onClick={onCancel} variant="outlined" sx={{ borderRadius: 2, px: 3, minWidth: 100 }}>{cancelText}</Button>
        <Button onClick={onOk} variant="contained" color="error" sx={{ borderRadius: 2, px: 3, minWidth: 100 }}>{okText}</Button>
      </DialogActions>
    </Dialog>
  )
}