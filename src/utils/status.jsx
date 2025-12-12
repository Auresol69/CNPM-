import { Chip } from '@mui/material'
import { getStatusMeta } from './statusMeta'

export function StatusChip({ code, size = 'small' }) {
  const meta = getStatusMeta(code)
  const Icon = meta.Icon
  return <Chip size={size} icon={Icon ? <Icon /> : null} label={meta.label} color={meta.color} variant={meta.color === 'default' ? 'outlined' : 'filled'} />
}
