import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { formatCoordinates } from '../lib/location/coordinates.js';

const external = { target: '_blank', rel: 'noopener noreferrer', color: 'inherit' };

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
      <Box>
        <Typography variant="caption" color="text.secondary" component="p">
          Calculated on your device with NOAA’s solar equations. Works offline.
        </Typography>
        {/* Required by the CC BY 4.0 licence of the worldwide place data. */}
        <Typography variant="caption" color="text.secondary" component="p">
          Place search by{' '}
          <Link href="https://open-meteo.com/" {...external}>
            Open-Meteo
          </Link>
          , data{' '}
          <Link href="https://www.geonames.org/" {...external}>
            GeoNames
          </Link>{' '}
          (
          <Link href="https://creativecommons.org/licenses/by/4.0/" {...external}>
            CC BY 4.0
          </Link>
          ).
        </Typography>
      </Box>
      {location ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCoordinates(location.lat, location.lng)} · {location.timeZone}
        </Typography>
      ) : null}
    </Box>
  );
}
