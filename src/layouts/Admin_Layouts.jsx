import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function Admin_Layouts() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const accessToken = localStorage.getItem('accessToken')
  
  if (!accessToken) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Outlet context={{ q: searchQuery, setQ: setSearchQuery }} />
        </Box>
      </Box>
    </Box>
  )
}