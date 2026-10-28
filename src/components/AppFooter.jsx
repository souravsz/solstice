import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatCoordinates } from '../lib/location/coordinates.js';

export function AppFooter({ location }) {
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, md: 8 },
        py: 3,
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Calculated on your device with NOAA’s solar equations. Works offline.
      </Typography>
      {location ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCoordinates(location.lat, location.lng)} · {location.timeZone}
        </Typography>
      ) : null}
    </Box>
  );
}
