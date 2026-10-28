import { useId } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { alpha } from '../lib/color/color.js';

const STATUS_TEXT = { next: 'Next', now: 'Now' };

/**
 * A card for one sun event: icon, label, value, and a thin accent line in the phase colour.
 * @param {{ status?: 'next' | 'now' | null }} props
 */
export function TimeCard({ icon: Icon, label, phase, status = null, children }) {
  const theme = useTheme();
  const id = useId();
  const accent = theme.palette.phase[phase];
  const highlighted = status !== null;

  return (
    <Card
      component="article"
      aria-labelledby={id}
      sx={{
        position: 'relative',
        height: '100%',
        borderColor: status === 'next' ? accent : undefined,
        backgroundColor: status === 'next' ? alpha(accent, theme.palette.mode === 'light' ? 0.04 : 0.08) : undefined,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 20,
          right: 20,
          height: highlighted ? 3 : 2,
          borderRadius: '0 0 3px 3px',
          backgroundColor: accent,
          opacity: highlighted ? 1 : 0.8,
          transition: theme.transitions.create(['height', 'opacity'], { duration: theme.transitions.duration.short }),
        },
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, minHeight: 24 }}>
          <Icon fontSize="small" aria-hidden sx={{ color: accent }} />
          <Typography id={id} component="h3" variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {label}
          </Typography>
          {status ? (
            <Box
              component="span"
              sx={{
                ml: 'auto',
                px: 1,
                py: 0.25,
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.4,
                color: status === 'next' ? theme.palette.surface.onInk : accent,
                backgroundColor: status === 'next' ? accent : 'transparent',
                border: `1px solid ${accent}`,
              }}
            >
              {STATUS_TEXT[status]}
            </Box>
          ) : null}
        </Box>
        <Box sx={{ mt: 'auto' }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
