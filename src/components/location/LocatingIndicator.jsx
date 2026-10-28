import Box from '@mui/material/Box';
import { keyframes, useTheme } from '@mui/material/styles';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

const travel = keyframes`
  0% { left: 0%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
`;

/**
 * A small "sun crossing the horizon" in place of a spinner while the position is found.
 * Static (a resting sun) when reduced motion is preferred.
 */
export function LocatingIndicator() {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const sun = theme.palette.phase.goldenHour;
  return (
    <Box aria-hidden sx={{ position: 'relative', height: 12, mx: 1, mt: 1.5 }}>
      <Box sx={{ position: 'absolute', left: 0, right: 0, top: 6, height: '1px', backgroundColor: 'divider' }} />
      <Box
        sx={{
          position: 'absolute',
          top: 1,
          left: reduceMotion ? '50%' : 0,
          width: 10,
          height: 10,
          ml: '-5px',
          borderRadius: '50%',
          backgroundColor: sun,
          boxShadow: `0 0 12px 2px ${sun}`,
          animation: reduceMotion ? 'none' : `${travel} 1.8s ${theme.transitions.easing.easeInOut} infinite`,
        }}
      />
    </Box>
  );
}
