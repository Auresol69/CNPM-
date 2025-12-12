import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    // PRIMARY: Màu Vàng nghệ (Màu xe buýt) - Dùng cho nút chính, điểm nhấn
    primary: { 
      main: '#F59E0B', 
      light: '#FCD34D',
      dark: '#B45309',
      contrastText: '#1F2937', // Quan trọng: Chữ màu đen để dễ đọc trên nền vàng
    },
    // SECONDARY: Màu Xanh dương đậm (Màu đồng phục/Tin cậy) - Dùng cho Header, Footer
    secondary: { 
      main: '#1E3A8A', 
      light: '#3B82F6',
      dark: '#172554',
      contrastText: '#ffffff', // Chữ trắng trên nền xanh
    },
    // WARNING: Màu Cam đỏ - Dùng cho cảnh báo kẹt xe/trễ giờ
    warning: { 
      main: '#ea580c', 
      dark: '#c2410c' 
    },
    // BACKGROUND: Màu trắng kem/xám nhạt sạch sẽ
    background: { 
      default: '#F3F4F6', 
      paper: '#FFFFFF' 
    },
    // TEXT: Màu chữ xám đen dịu mắt
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    }
  },
  // Giữ nguyên độ bo góc mềm mại của bạn
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    // Tùy chỉnh thêm nút bấm cho đẹp
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bold', // Nút bấm in đậm cho khỏe khoắn
          textTransform: 'none', // Không viết hoa toàn bộ chữ (trông thân thiện hơn)
        },
      },
    },
  },
})

export default theme