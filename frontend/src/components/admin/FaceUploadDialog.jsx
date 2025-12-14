import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogActions, Button, Box, Typography,
  Avatar, Stack, IconButton, Alert, CircularProgress,
  ImageList, ImageListItem, ImageListItemBar, Chip, LinearProgress
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import FaceIcon from '@mui/icons-material/Face'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import { AdminService } from '../../services/admin/AdminService'
import { useNotify } from '../../pages/admin/hooks/useNotify'

export default function FaceUploadDialog({ open, onClose, student, onSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewImages, setPreviewImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const notify = useNotify()

  // Reset state khi mở dialog
  useEffect(() => {
    if (open) {
      setError('')
      setSuccess('')
      setPreviewImages([])
      setUploadProgress(0)
    }
  }, [open])

  // Xử lý chọn file
  const handleFileSelect = (event) => {
    const files = Array.from(event. target.files)
    setError('')

    const validFiles = []
    for (const file of files) {
      if (! file.type.startsWith('image/')) {
        setError('Chỉ chấp nhận file ảnh (JPG, PNG)')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File ảnh phải nhỏ hơn 5MB')
        continue
      }
      validFiles.push(file)
    }

    // Tạo preview
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader. onload = (e) => {
        setPreviewImages(prev => [...prev, {
          file: file,
          preview: e.target. result,
          status: 'pending',
          errorMsg: ''
        }])
      }
      reader.readAsDataURL(file)
    })

    // Reset input để có thể chọn lại cùng file
    event.target.value = ''
  }

  // Xóa ảnh preview
  const removePreview = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  // Upload tất cả ảnh
  const handleUploadAll = async () => {
    const pendingImages = previewImages.filter(img => img.status === 'pending')
    if (pendingImages. length === 0) {
      setError('Vui lòng chọn ít nhất 1 ảnh mới')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < previewImages.length; i++) {
      const img = previewImages[i]
      if (img.status !== 'pending') continue

      // Cập nhật progress
      setUploadProgress(Math.round(((i + 1) / previewImages. length) * 100))

      // Cập nhật status uploading
      setPreviewImages(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'uploading' } : item
      ))

      try {
        await AdminService.uploadStudentFace(student._id, img.file)

        setPreviewImages(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'success' } : item
        ))
        successCount++
      } catch (err) {
        console.error('Upload error:', err)
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Lỗi không xác định'

        setPreviewImages(prev => prev. map((item, idx) =>
          idx === i ? { ... item, status: 'error', errorMsg } : item
        ))
        errorCount++
      }
    }

    setUploading(false)
    setUploadProgress(0)

    if (successCount > 0) {
      setSuccess(`🎉 Đã đăng ký thành công ${successCount} ảnh khuôn mặt! `)
      notify. success(`Đã đăng ký ${successCount} ảnh khuôn mặt cho ${student. name}`)
      if (onSuccess) onSuccess()
    }
    if (errorCount > 0 && successCount === 0) {
      setError(`Tất cả ${errorCount} ảnh đều thất bại.  Vui lòng kiểm tra lại.`)
    } else if (errorCount > 0) {
      setError(`Có ${errorCount} ảnh không hợp lệ (có thể không tìm thấy khuôn mặt)`)
    }
  }

  const pendingCount = previewImages. filter(img => img.status === 'pending').length
  const successCount = previewImages.filter(img => img.status === 'success'). length

  if (! student) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header với gradient */}
      <Box sx={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        p: 3,
        color: 'white',
        position: 'relative'
      }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
          disabled={uploading}
        >
          <CloseIcon />
        </IconButton>

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={student.avatar}
            sx={{
              width: 70,
              height: 70,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.5)'
            }}
          >
            <FaceIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              📸 Đăng ký khuôn mặt
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {student.name} - {student.grade || student.class}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {student.hasFaceData ?  (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Đã có dữ liệu"
                  size="small"
                  sx={{ bgcolor: 'rgba(34,197,94,0.3)', color: 'white' }}
                />
              ) : (
                <Chip
                  icon={<InfoIcon />}
                  label="Chưa đăng ký"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Progress bar khi đang upload */}
      {uploading && (
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{ height: 4 }}
        />
      )}

      <DialogContent sx={{ p: 3 }}>
        {/* Thông báo lỗi/thành công */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setError('')}
            icon={<ErrorIcon />}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Hướng dẫn chi tiết */}
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2,
            bgcolor: '#eff6ff',
            '& .MuiAlert-icon': { color: '#3b82f6' }
          }}
        >
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
            📋 Hướng dẫn chụp ảnh đạt chuẩn:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <li>Ảnh chụp rõ mặt, nhìn thẳng vào camera</li>
            <li>Đủ ánh sáng, không bị tối hoặc ngược sáng</li>
            <li><strong>Chỉ có 1 người trong ảnh</strong></li>
            <li>Nên upload 3-5 ảnh từ nhiều góc độ để tăng độ chính xác</li>
            <li>Tránh đeo kính râm hoặc khẩu trang che mặt</li>
          </Box>
        </Alert>

        {/* Input file ẩn */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Nút chọn ảnh */}
        <Button
          variant="outlined"
          fullWidth
          startIcon={<CameraAltIcon />}
          onClick={() => fileInputRef.current?. click()}
          disabled={uploading}
          sx={{
            py: 2.5,
            mb: 3,
            borderRadius: 2,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#6366f1',
            color: '#6366f1',
            '&:hover': {
              borderColor: '#4f46e5',
              bgcolor: '#f5f3ff'
            }
          }}
        >
          Chọn ảnh từ máy tính
        </Button>

        {/* Preview ảnh đã chọn */}
        {previewImages. length > 0 ?  (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="600">
                Ảnh đã chọn ({previewImages.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                {pendingCount > 0 && (
                  <Chip label={`${pendingCount} chờ upload`} size="small" color="warning" variant="outlined" />
                )}
                {successCount > 0 && (
                  <Chip label={`${successCount} thành công`} size="small" color="success" variant="outlined" />
                )}
              </Stack>
            </Stack>

            <ImageList cols={3} gap={12} sx={{ mt: 0 }}>
              {previewImages.map((img, index) => (
                <ImageListItem
                  key={index}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    border: img.status === 'success' ? '3px solid #22c55e' :
                      img.status === 'error' ? '3px solid #ef4444' :
                        '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      height: 120,
                      objectFit: 'cover',
                      opacity: img.status === 'uploading' ? 0.5 : 1
                    }}
                  />

                  {/* Overlay loading */}
                  {img.status === 'uploading' && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(99, 102, 241, 0. 4)'
                    }}>
                      <CircularProgress size={36} sx={{ color: 'white' }} />
                    </Box>
                  )}

                  {/* Badge thành công */}
                  {img.status === 'success' && (
                    <Box sx={{
                      position: 'absolute',
                      top: 8, right: 8,
                      bgcolor: '#22c55e',
                      borderRadius: '50%',
                      p: 0.5,
                      boxShadow: '0 2px 8px rgba(34,197,94,0.5)'
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                  )}

                  {/* Badge lỗi */}
                  {img.status === 'error' && (
                    <ImageListItemBar
                      title={<Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{img.errorMsg}</Typography>}
                      sx={{
                        background: 'rgba(239, 68, 68, 0. 95)',
                        '& .MuiImageListItemBar-title': {
                          whiteSpace: 'normal',
                          lineHeight: 1.2
                        }
                      }}
                    />
                  )}

                  {/* Nút xóa (chỉ hiện khi pending) */}
                  {img.status === 'pending' && (
                    <ImageListItemBar
                      sx={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}
                      actionIcon={
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => removePreview(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    />
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        ) : (
          /* Placeholder khi chưa có ảnh */
          <Box sx={{
            textAlign: 'center',
            py: 5,
            bgcolor: '#f8fafc',
            borderRadius: 3,
            border: '2px dashed #e2e8f0'
          }}>
            <FaceIcon sx={{ fontSize: 70, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Chưa có ảnh nào được chọn
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bấm nút ở trên để chọn ảnh từ máy tính
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{ borderRadius: 2, px: 3 }}
          disabled={uploading}
        >
          {successCount > 0 ? 'Đóng' : 'Hủy'}
        </Button>
        <Button
          variant="contained"
          startIcon={uploading ?  <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          onClick={handleUploadAll}
          disabled={uploading || pendingCount === 0}
          sx={{
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
            },
            '&. Mui-disabled': {
              background: '#e2e8f0'
            }
          }}
        >
          {uploading ? 'Đang xử lý...' : `Upload ${pendingCount} ảnh`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}