import React from "react"
import { Box, Typography, Paper } from "@mui/material"

export default function Assignments() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Phân công
      </Typography>
      <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          Chức năng phân công đang được phát triển...
        </Typography>
      </Paper>
    </Box>
  )
}
