import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'

// Pages - Auth
import TrangChu from './Trang_Chu/trang_chu'
import Login_Admin from './Trang_Chu/Login_Admin'
import Login_Parents from './Trang_Chu/Login_Parents'
import Login_Driver from './Trang_Chu/Login_Driver'

// Layout
import Admin_Layouts from './layouts/Admin_Layouts'

// Pages - Admin
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Driver from './pages/Driver'
import Bus from './pages/Bus'
import Stations from './pages/Stations'
import RoutesPage from './pages/Routes'
import Schedules from './pages/Schedules'
import ScheduleDetail from './pages/ScheduleDetail'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import Alerts from './pages/Alerts'
import Messages from './pages/Messages'
import Tracking from './pages/Tracking'



// Theme
const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    secondary: { main: '#ec4899' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    background: { default: '#f8fafc' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
      }
    }
  }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={3000}
      >
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<TrangChu />} />
            <Route path="/admin/login" element={<Login_Admin />} />
            <Route path="/parents/login" element={<Login_Parents />} />
            <Route path="/driver/login" element={<Login_Driver />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Admin_Layouts />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="drivers" element={<Driver />} />
              <Route path="buses" element={<Bus />} />
              <Route path="stations" element={<Stations />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="schedules/:id" element={<ScheduleDetail />} />
              <Route path="trips" element={<Trips />} />
              <Route path="trips/:id" element={<TripDetail />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="messages" element={<Messages />} />
              <Route path="tracking" element={<Tracking />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
