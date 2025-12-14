import React from 'react'
import { Paper, Box, TextField, InputAdornment, Chip, List, ListItemButton, ListItemText, Divider, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function VehicleList({ items, selectedId, onSelect, onQueryChange, query, statusFilter, onStatusFilter }) {
  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'onTime', label: 'Đúng giờ' },
    { key: 'delayed', label: 'Trễ' },
    { key: 'stale', label: 'Mất tín hiệu' },
  ]

  return (
    <Paper sx={{ width: 340, height: 520, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1.5, pb: 0.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Danh sách xe</Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm theo biển số / tài xế / tuyến"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              size="small"
              label={f.label}
              color={statusFilter === f.key ? 'primary' : 'default'}
              variant={statusFilter === f.key ? 'filled' : 'outlined'}
              onClick={() => onStatusFilter?.(f.key)}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', mt: 1 }}>
        <List>
          {items.map(({ trip, bus, punctuality, statusMeta }) => (
            <Box key={trip.trip_id}>
              <ListItemButton selected={selectedId === bus.bus_id} onClick={() => onSelect?.(bus.bus_id)}>
                <ListItemText
                  primary={`${trip?.route?.name || '—'}`}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip size="small" label={bus?.plate_number || ''} />
                      <Typography variant="caption" color="text.secondary">{trip?.driver?.name || ''}</Typography>
                      <Chip size="small" color={punctuality.color} label={punctuality.label} />
                      {statusMeta && <Chip size="small" color={statusMeta.color} label={statusMeta.label} />}
                    </Box>
                  }
                />
              </ListItemButton>
              <Divider />
            </Box>
          ))}
        </List>
      </Box>
    </Paper>
  )
}
