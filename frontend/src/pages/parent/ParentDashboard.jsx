import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import History from "@mui/icons-material/History";
import EventBusy from "@mui/icons-material/EventBusy";
import Notifications from "@mui/icons-material/Notifications";
import Phone from "@mui/icons-material/Phone";
import ArrowForward from "@mui/icons-material/ArrowForward";
import { useNavigate, Link } from "react-router-dom";

// Mock Data
const studentInfo = {
  name: "Nguyễn Văn A",
  class: "1A",
  avatar: "/path-to-avatar.jpg", // Placeholder
  status: "Đang trên xe về nhà",
  statusColor: "success",
};

const stats = {
  weeklyTrips: 8,
  lateCount: 0,
};

const recentActivities = [
  { time: "16:30", activity: "Đã về điểm trả an toàn." },
  { time: "07:05", activity: "Đã lên xe tại điểm đón." },
  { time: "07:00", activity: "Xe buýt đã bắt đầu chuyến đi." },
];

const quickMenuItems = [
  { text: "Xin nghỉ phép", icon: <EventBusy />, link: "/parent/features" },
  { text: "Thông báo", icon: <Notifications />, link: "/parent/notifications" },
  { text: "Hotline Tài xế", icon: <Phone />, link: "tel:0909123456" },
];

export default function ParentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Typography
        variant="h4"
        component="h1"
        className="font-bold text-gray-800 mb-6"
      >
        Bảng điều khiển
      </Typography>

      <Grid container spacing={4}>
        {/* Cột 1 - Thẻ Học sinh */}
        <Grid item xs={12} md={5} lg={4}>
          <Card elevation={3} className="h-full flex flex-col">
            <CardContent className="flex-grow text-center">
              <Avatar sx={{ width: 80, height: 80, margin: "0 auto 16px" }} />
              <Typography variant="h5" component="div" className="font-bold">
                {studentInfo.name}
              </Typography>
              <Typography color="text.secondary" className="mb-4">
                Lớp {studentInfo.class}
              </Typography>
              <Chip
                icon={<CheckCircle />}
                label={studentInfo.status}
                color={studentInfo.statusColor}
                className="font-semibold"
              />
            </CardContent>
            <Box className="p-4">
              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForward />}
                onClick={() => navigate("/parent/tracking")}
              >
                Xem vị trí xe
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Cột 2 - Thống kê & Hoạt động */}
        <Grid item xs={12} md={4} lg={5} className="space-y-4">
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="font-semibold mb-2">
              Thống kê tuần
            </Typography>
            <Box className="flex justify-around text-center">
              <div>
                <Typography variant="h4" className="font-bold">
                  {stats.weeklyTrips}
                </Typography>
                <Typography color="text.secondary">Số chuyến</Typography>
              </div>
              <div>
                <Typography variant="h4" className="font-bold text-green-600">
                  {stats.lateCount}
                </Typography>
                <Typography color="text.secondary">Lần trễ</Typography>
              </div>
            </Box>
          </Paper>
          <Paper elevation={2} className="p-4">
            <Typography variant="h6" className="font-semibold mb-2">
              Hoạt động gần đây
            </Typography>
            <List dense>
              {recentActivities.map((item, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon>
                    <History fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={`${item.time} - ${item.activity}`} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Cột 3 - Menu nhanh */}
        <Grid item xs={12} md={3} lg={3}>
          <Paper elevation={2} className="p-4 h-full">
            <Typography variant="h6" className="font-semibold mb-4 text-center">
              Menu nhanh
            </Typography>
            <Grid container spacing={2} className="text-center">
              {quickMenuItems.map((item) => (
                <Grid item xs={4} md={12} key={item.text}>
                  <Button
                    component={Link}
                    to={item.link}
                    variant="outlined"
                    className="flex flex-col h-24 w-full"
                  >
                    <Box className="text-3xl">{item.icon}</Box>
                    <Typography variant="caption">{item.text}</Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
