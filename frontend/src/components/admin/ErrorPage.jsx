import { Box, Button, Stack, Typography } from '@mui/material'
import { useRouteError, Link as RouterLink } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  const message = (error && (error.statusText || error.message)) || 'Unexpected error'
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Stack spacing={2} sx={{ maxWidth: 640 }}>
        <Typography variant="h4" fontWeight={700}>Đã xảy ra lỗi</Typography>
        <Typography color="text.secondary">{String(message)}</Typography>
        <Button variant="contained" component={RouterLink} to="/">Về trang chính</Button>
      </Stack>
    </Box>
  )
}
