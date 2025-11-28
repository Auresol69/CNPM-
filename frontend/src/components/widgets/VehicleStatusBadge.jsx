import React from 'react';
import { Chip } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const VehicleStatusBadge = ({ status }) => {
  let color = 'default';
  let label = 'Không xác định';

  switch (status) {
    case 'moving':
      color = 'success';
      label = 'Đang di chuyển';
      break;
    case 'stopped':
      color = 'warning';
      label = 'Đang dừng';
      break;
    case 'offline':
      color = 'error';
      label = 'Mất kết nối';
      break;
    default:
      break;
  }

  return (
    <Chip
      icon={<DirectionsBusIcon />}
      label={label}
      color={color}
      variant="filled"
      size="small"
    />
  );
};

export default VehicleStatusBadge;
