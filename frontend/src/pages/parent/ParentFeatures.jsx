import { useState } from "react";
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Modal,
  Button,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import EventBusy from "@mui/icons-material/EventBusy";
import History from "@mui/icons-material/History";
import LocationOn from "@mui/icons-material/LocationOn";
import Feedback from "@mui/icons-material/Feedback";
import Close from "@mui/icons-material/Close";

// Mock Data for features
const features = [
  {
    id: "leave",
    title: "Xin nghỉ phép",
    description: "Gửi yêu cầu nghỉ học cho bé.",
    icon: <EventBusy fontSize="large" color="primary" />,
  },
  {
    id: "history",
    title: "Lịch sử chuyến đi",
    description: "Xem lại các hành trình đã hoàn thành.",
    icon: <History fontSize="large" color="secondary" />,
  },
  {
    id: "pickup",
    title: "Thay đổi điểm đón",
    description: "Yêu cầu thay đổi điểm đón tạm thời.",
    icon: <LocationOn fontSize="large" color="success" />,
  },
  {
    id: "feedback",
    title: "Góp ý",
    description: "Gửi phản hồi về chất lượng dịch vụ.",
    icon: <Feedback fontSize="large" color="action" />,
  },
];

// Style for the modal
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function ParentFeatures() {
  const [openModal, setOpenModal] = useState(false);

  const handleCardClick = (id) => {
    if (id === "leave") {
      setOpenModal(true);
    } else {
      alert("Chức năng đang phát triển");
    }
  };

  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Typography
        variant="h4"
        component="h1"
        className="font-bold text-gray-800 mb-6"
      >
        Tiện ích & Chức năng
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={feature.id}>
            <Card elevation={3} className="h-full">
              <CardActionArea
                onClick={() => handleCardClick(feature.id)}
                className="h-full flex flex-col justify-center items-center text-center p-4"
              >
                <Box className="mb-2">{feature.icon}</Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Leave Request Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper sx={modalStyle}>
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6" component="h2">
              Đơn xin nghỉ phép
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>
          <TextField
            label="Chọn ngày nghỉ"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            className="mb-4"
          />
          <TextField
            label="Lý do (không bắt buộc)"
            multiline
            rows={3}
            fullWidth
            className="mb-4"
          />
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              alert("Yêu cầu đã được gửi!");
              handleCloseModal();
            }}
          >
            Gửi yêu cầu
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
}
