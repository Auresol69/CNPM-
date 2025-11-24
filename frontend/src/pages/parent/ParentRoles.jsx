import { Box, Button, Typography } from "@mui/material";
import { Engineering } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function ParentRoles() {
  return (
    <Box
      className="flex flex-col items-center justify-center text-center p-4"
      sx={{ height: "calc(100vh - 128px)" }} // Adjust height to fill viewport minus header/footer
    >
      <Engineering sx={{ fontSize: 80 }} color="action" className="mb-4" />
      <Typography variant="h5" component="h1" className="font-semibold mb-2">
        Coming Soon!
      </Typography>
      <Typography color="text.secondary" className="max-w-md mb-6">
        Tính năng 'Quản lý người đưa đón' đang được đội ngũ kỹ sư của chúng tôi
        xây dựng và sẽ sớm ra mắt.
      </Typography>
      <Button component={Link} to="/parent/dashboard" variant="contained">
        Quay lại Dashboard
      </Button>
    </Box>
  );
}
