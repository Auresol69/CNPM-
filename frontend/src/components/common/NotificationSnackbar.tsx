import React from 'react';
import { Snackbar, Alert, Button, AlertColor } from '@mui/material';

interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor; // 'success' | 'info' | 'warning' | 'error'
  evidenceUrl?: string | null;
  onViewPhoto?: () => void;
  onClose?: () => void;
}

export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({ 
  open, 
  message, 
  severity = 'info', 
  evidenceUrl, 
  onViewPhoto, 
  onClose 
}) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ zIndex: 9999 }} // Ensure it appears above everything
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%', alignItems: 'center' }} variant="filled">
        {message}
        {evidenceUrl && (
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => {
              if (onViewPhoto) onViewPhoto();
            }} 
            sx={{ ml: 2, textDecoration: 'underline', fontWeight: 'bold', whiteSpace: 'nowrap' }}
          >
            Xem ảnh
          </Button>
        )}
      </Alert>
    </Snackbar>
  );
};
