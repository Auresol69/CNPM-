import React from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ count = 0 }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/parent/notifications');
  };

  return (
    <IconButton color="inherit" onClick={handleClick}>
      <Badge badgeContent={count} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBell;
