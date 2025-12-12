import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Stack, Button, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';
import { AdminService } from "../api/services";
import { useNotify } from '../hooks/useNotify';

export default function Messages() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await AdminService.listMessages();
      setRows(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Tin nhắn
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Quản lý tin nhắn với phụ huynh và tài xế
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={fetchData}
          sx={{ borderRadius: 2 }}
        >
          Làm mới
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {rows.length > 0 ? (
          <List sx={{ py: 0 }}>
            {rows.map((msg, idx) => (
              <React.Fragment key={msg._id || msg.message_id || idx}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#6366f1' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600}>
                          {msg.senderId?.name || 'Người dùng'}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={msg.isRead ? 'Đã đọc' : 'Chưa đọc'} 
                          color={msg.isRead ? 'default' : 'primary'}
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#1e293b' }}>
                          {msg.content || msg.message_text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN') : 
                           msg.sent_at ? new Date(msg.sent_at).toLocaleString('vi-VN') : '—'}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                {idx < rows.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <MessageIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
            <Typography color="text.secondary">
              {loading ? 'Đang tải...' : 'Chưa có tin nhắn nào'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}