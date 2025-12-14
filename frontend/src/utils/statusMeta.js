import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ScheduleIcon from '@mui/icons-material/Schedule'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CancelIcon from '@mui/icons-material/Cancel'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'
import BuildIcon from '@mui/icons-material/Build'

// Centralized status meta for consistent labels, colors, and component Icons (not JSX)
export const STATUS_META = {
  // Trip statuses
  IN_PROGRESS: { label: 'Đang chạy', color: 'success', Icon: PlayArrowIcon },
  RUNNING: { label: 'Đang chạy', color: 'success', Icon: PlayArrowIcon },
  SCHEDULED: { label: 'Đã lên lịch', color: 'info', Icon: ScheduleIcon },
  COMPLETED: { label: 'Hoàn thành', color: 'success', Icon: CheckCircleIcon },
  LATE: { label: 'Trễ giờ', color: 'warning', Icon: WarningAmberIcon },
  CANCELLED: { label: 'Hủy chuyến', color: 'error', Icon: CancelIcon },

  // Bus statuses
  ACTIVE: { label: 'Hoạt động', color: 'success', Icon: DirectionsBusIcon },
  INACTIVE: { label: 'Không hoạt động', color: 'default', Icon: DirectionsBusIcon },
  MAINTENANCE: { label: 'Bảo trì', color: 'warning', Icon: BuildIcon },
}

export function getStatusMeta(code = '') {
  const key = String(code || '').toUpperCase()
  return STATUS_META[key] || { label: code || '—', color: 'default', Icon: null }
}
