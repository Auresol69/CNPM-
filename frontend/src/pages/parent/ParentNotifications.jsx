import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import Info from "@mui/icons-material/Info";
import Warning from "@mui/icons-material/Warning";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import CheckCircle from "@mui/icons-material/CheckCircle";

// Mock Data
const notifications = [
  {
    id: 1,
    type: "info",
    icon: <CheckCircle />,
    color: "success",
    bgColor: "bg-green-50",
    message: "Bé An đã lên xe an toàn.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 2,
    type: "warning",
    icon: <Warning />,
    color: "warning",
    bgColor: "bg-yellow-50",
    message: "Xe sắp đến điểm đón của bạn (còn khoảng 500m).",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 3,
    type: "alert",
    icon: <ErrorOutline />,
    color: "error",
    bgColor: "bg-red-50",
    message: "Cảnh báo: Xe gặp sự cố kẹt xe, dự kiến trễ 15 phút.",
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    id: 4,
    type: "info",
    icon: <Info />,
    color: "info",
    bgColor: "bg-blue-50",
    message: "Xe buýt đã bắt đầu chuyến đi buổi sáng.",
    timestamp: new Date(Date.now() - 65 * 60 * 1000),
  },
  {
    id: 5,
    type: "info",
    icon: <CheckCircle />,
    color: "success",
    bgColor: "bg-green-50",
    message: "Bé An đã về nhà an toàn.",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

/**
 * Formats a date into a relative time string (e.g., "10 phút trước").
 * @param {Date} date The date to format.
 * @returns {string} The formatted relative time string.
 */
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000; // Years
  if (interval > 1) return `${Math.floor(interval)} năm trước`;

  interval = seconds / 2592000; // Months
  if (interval > 1) return `${Math.floor(interval)} tháng trước`;

  interval = seconds / 86400; // Days
  if (interval > 1) return `${Math.floor(interval)} ngày trước`;

  interval = seconds / 3600; // Hours
  if (interval > 1) return `${Math.floor(interval)} giờ trước`;

  interval = seconds / 60; // Minutes
  if (interval > 1) return `${Math.floor(interval)} phút trước`;

  return "Vừa xong";
}

export default function ParentNotifications() {
  return (
    <Box className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Typography
        variant="h4"
        component="h1"
        className="font-bold text-gray-800 mb-6"
      >
        Thông báo
      </Typography>

      <Paper elevation={2} className="max-w-3xl mx-auto">
        <List disablePadding>
          {notifications.map((notification, index) => (
            <ListItem
              key={notification.id}
              divider={index < notifications.length - 1}
              className={`${notification.bgColor} border-l-4`}
              sx={{
                borderColor: (theme) => theme.palette[notification.color].main,
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: (theme) => theme.palette[notification.color].main,
                  }}
                >
                  {notification.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography component="span" variant="body1">
                    {notification.message}
                  </Typography>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {formatTimeAgo(notification.timestamp)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
