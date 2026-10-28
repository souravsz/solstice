import Chip from '@mui/material/Chip';
import { alpha } from '../../lib/color/color.js';

/**
 * A small filled chip in a sun tone: the colour at 12% as the background,
 * with the tone's readable text shade on top.
 * @param {{ tone: 'golden' | 'blue', label: import('react').ReactNode }} props
 */
export function SoftChip({ tone, label, sx, ...props }) {
  return (
    <Chip
      size="small"
      variant="filled"
      label={label}
      sx={[
        (theme) => ({
          height: 22,
          border: 0,
          flexShrink: 0,
          fontWeight: 600,
          fontSize: theme.typography.tick.fontSize,
          fontVariantNumeric: 'tabular-nums',
          color: theme.palette.sun[`${tone}Text`],
          backgroundColor: alpha(theme.palette.sun[tone], 0.12),
          '& .MuiChip-label': { px: 1 },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}

