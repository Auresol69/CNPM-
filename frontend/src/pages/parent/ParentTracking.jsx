import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import Map from "@mui/icons-material/Map";
import Phone from "@mui/icons-material/Phone";
import DirectionsBus from "@mui/icons-material/DirectionsBus";
import Speed from "@mui/icons-material/Speed";
import Timer from "@mui/icons-material/Timer";
import Route from "@mui/icons-material/Route";

// Mock Data ban đầu
const driverInfo = {
  name: "Trần Văn B",
  phone: "0987654321",
  avatar: "/path-to-driver-avatar.jpg", // Placeholder
};

const vehicleInfo = {
  plateNumber: "51B-123.45",
  type: "School Bus 16 chỗ",
};

export default function ParentTracking() {
  // State cho các thông số 'sống'
  const [metrics, setMetrics] = useState({
    speed: 45,
    eta: 15, // phút
    distance: 5, // km
  });

  // Logic giả lập (Simulation)
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setMetrics((prevMetrics) => {
        const newSpeed = Math.floor(Math.random() * (50 - 30 + 1)) + 30; // Tốc độ ngẫu nhiên từ 30-50 km/h
        const distanceCovered = (prevMetrics.speed / 3600) * 3; // Quãng đường đi được trong 3s
        const newDistance = Math.max(0, prevMetrics.distance - distanceCovered);
        const newEta = Math.round((newDistance / newSpeed) * 60); // Tính lại ETA

        return {
          speed: newSpeed,
          eta: newEta > 0 ? newEta : 0,
          distance: parseFloat(newDistance.toFixed(2)),
        };
      });
    }, 3000); // Cập nhật mỗi 3 giây

    // Cleanup interval khi component unmount
    return () => clearInterval(simulationInterval);
  }, []);

  return (
    <Box className="flex h-[calc(100vh-64px)]">
      {/* Phần Trái (Thông tin hành trình - Sidebar) */}
      <Paper elevation={4} className="w-[30%] h-full p-4 overflow-y-auto">
        <Typography variant="h5" className="font-bold mb-4">
          Thông tin hành trình
        </Typography>

        {/* Thông tin tài xế */}
        <Box className="text-center mb-4">
          <Avatar sx={{ width: 80, height: 80, margin: "auto" }} />
          <Typography variant="h6" className="mt-2 font-semibold">
            {driverInfo.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Phone />}
            href={`tel:${driverInfo.phone}`}
            className="mt-2"
          >
            Gọi tài xế
          </Button>
        </Box>

        <Divider className="my-4" />

        {/* Thông tin xe */}
        <Typography variant="h6" className="font-semibold mb-2">
          Chi tiết xe
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <DirectionsBus />
            </ListItemIcon>
            <ListItemText
              primary="Biển số"
              secondary={vehicleInfo.plateNumber}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <DirectionsBus />
            </ListItemIcon>
            <ListItemText primary="Loại xe" secondary={vehicleInfo.type} />
          </ListItem>
        </List>

        <Divider className="my-4" />

        {/* Real-time Metrics */}
        <Typography variant="h6" className="font-semibold mb-2">
          Thông số thời gian thực
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <Speed />
            </ListItemIcon>
            <ListItemText
              primary="Tốc độ"
              secondary={`${metrics.speed} km/h`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Timer />
            </ListItemIcon>
            <ListItemText
              primary="Dự kiến đến (ETA)"
              secondary={`${metrics.eta} phút`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Route />
            </ListItemIcon>
            <ListItemText
              primary="Khoảng cách còn lại"
              secondary={`${metrics.distance} km`}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Phần Phải (Bản đồ Placeholder) */}
      <Box className="w-[70%] h-full bg-slate-100 flex flex-col items-center justify-center text-center">
        <CircularProgress className="mb-4" />
        <Map sx={{ fontSize: 60 }} color="action" />
        <Typography variant="h6" color="text.secondary" className="mt-2">
          Bản đồ Google Maps đang được tích hợp...
        </Typography>
      </Box>
    </Box>
  );
}
