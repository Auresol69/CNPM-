import { useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'

// Lấy URL socket từ VITE_SOCKET_URL hoặc fallback từ API URL
const getSocketUrl = () => {
  // Ưu tiên VITE_SOCKET_URL nếu có
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }
  // Fallback: lấy từ API URL và bỏ /api/v1
  const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://smart-school-bus-api.onrender.com/api/v1'
  return apiUrl.replace('/api/v1', '')
}

const SOCKET_URL = getSocketUrl()

export function useSocket() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    console.log('🔌 Connecting to Socket.IO:', SOCKET_URL)

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    // Connection events
    newSocket.on('connect', () => {
      // Sửa lỗi cú pháp: .id
      console.log('✅ Socket connected! ID:', newSocket.id)
      setConnected(true)
      setError(null)
      // Sửa lỗi cú pháp: .current
      reconnectAttempts.current = 0
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      // Sửa lỗi cú pháp: .message
      console.error('🔴 Socket connection error:', err.message)
      // Sửa lỗi cú pháp: .message
      setError(err.message)
      // Sửa lỗi cú pháp: .current
      reconnectAttempts.current += 1

      // Sửa lỗi cú pháp: .current
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.log('⚠️ Max reconnection attempts reached')
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts')
      setConnected(true)
      setError(null)
    })

    newSocket.on('reconnect_error', (err) => {
      // Sửa lỗi cú pháp: .message
      console.error('🔴 Socket reconnection error:', err.message)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      console.log('🔌 Closing socket connection...')
      newSocket.close()
    }
  }, [])

  // Join room để theo dõi một chuyến đi cụ thể
  const joinTrip = useCallback((tripId) => {
    if (socket && connected) {
      console.log('📡 Joining trip room:', tripId)
      // Sửa lỗi cú pháp: .emit
      socket.emit('join:trip', tripId)
    }
  }, [socket, connected])

  // Rời khỏi room
  const leaveTrip = useCallback((tripId) => {
    if (socket && connected) {
      console.log('📡 Leaving trip room:', tripId)
      // Sửa lỗi cú pháp: .emit
      socket.emit('leave:trip', tripId)
    }
  }, [socket, connected])

  // Join room để nhận thông báo của user
  const joinUserRoom = useCallback((userId) => {
    if (socket && connected) {
      console.log('📡 Joining user room:', userId)
      // Sửa lỗi cú pháp: .emit
      socket.emit('join:user', userId)
    }
  }, [socket, connected])

  // Lắng nghe sự kiện học sinh check-in
  const onStudentCheckedIn = useCallback((callback) => {
    if (socket) {
      // Sửa lỗi cú pháp: .on
      socket.on('student:checked_in', (data) => {
        console.log('🎉 Student checked in event:', data)
        callback(data)
      })

      // Return cleanup function
      return () => {
        // Sửa lỗi cú pháp: .off
        socket.off('student:checked_in')
      }
    }
  }, [socket])

  // Lắng nghe cập nhật vị trí xe
  const onBusLocationUpdate = useCallback((callback) => {
    if (socket) {
      // Sửa lỗi cú pháp: .on
      socket.on('bus:location_update', (data) => {
        console.log('🚌 Bus location update:', data)
        callback(data)
      })

      return () => {
        // Sửa lỗi cú pháp: .off
        socket.off('bus:location_update')
      }
    }
  }, [socket])

  // Lắng nghe thông báo xe sắp đến trạm
  const onBusApproaching = useCallback((callback) => {
    if (socket) {
      // Sửa lỗi cú pháp: .on
      socket.on('bus:approaching', (data) => {
        console.log('🚌 Bus approaching station:', data)
        callback(data)
      })

      return () => {
        // Sửa lỗi cú pháp: .off
        socket.off('bus:approaching')
      }
    }
  }, [socket])

  // Lắng nghe thông báo xe đã đến trạm
  const onBusArrived = useCallback((callback) => {
    if (socket) {
      // Sửa lỗi cú pháp: .on
      socket.on('bus:arrived', (data) => {
        console.log('🚌 Bus arrived at station:', data)
        callback(data)
      })

      return () => {
        // Sửa lỗi cú pháp: .off
        socket.off('bus:arrived')
      }
    }
  }, [socket])

  // Lắng nghe thông báo mới
  const onNewNotification = useCallback((callback) => {
    if (socket) {
      // Sửa lỗi cú pháp: .on
      socket.on('notification:new', (data) => {
        console.log('🔔 New notification:', data)
        callback(data)
      })

      return () => {
        // Sửa lỗi cú pháp: .off
        socket.off('notification:new')
      }
    }
  }, [socket])

  // Lắng nghe cập nhật trạng thái chuyến đi
  const onTripStatusUpdate = useCallback((callback) => {
    if (socket) {
      // Sửa lỗi cú pháp: .on
      socket.on('trip:status_update', (data) => {
        console.log('📊 Trip status update:', data)
        callback(data)
      })

      return () => {
        // Sửa lỗi cú pháp: .off
        socket.off('trip:status_update')
      }
    }
  }, [socket])

  // Lắng nghe cảnh báo SOS
  const onSOSAlert = useCallback((callback) => {
    if (socket) {
      // Sửa lỗi cú pháp: .on
      socket.on('alert:sos', (data) => {
        console.log('🆘 SOS Alert:', data)
        callback(data)
      })

      return () => {
        // Sửa lỗi cú pháp: .off
        socket.off('alert:sos')
      }
    }
  }, [socket])

  // Gửi vị trí GPS (dành cho driver app, nhưng có thể test từ admin)
  const sendLocation = useCallback((tripId, latitude, longitude) => {
    if (socket && connected) {
      socket.emit('location:update', {
        tripId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      })
    }
  }, [socket, connected])

  return {
    socket,
    connected,
    error,
    // Room management
    joinTrip,
    leaveTrip,
    joinUserRoom,
    // Event listeners
    onStudentCheckedIn,
    onBusLocationUpdate,
    onBusApproaching,
    onBusArrived,
    onNewNotification,
    onTripStatusUpdate,
    onSOSAlert,
    // Emit events
    sendLocation
  }
}

export default useSocket
