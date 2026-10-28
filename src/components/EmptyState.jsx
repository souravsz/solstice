import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import { skyGradient } from '../lib/sky/skyGradient.js';
import { radius } from '../theme/tokens.js';

const sky = skyGradient(-3);

/** First launch, before a location is chosen: a calm dawn sky and one clear action. */
export function EmptyState({ onChooseLocation }) {
  return (
    <Box
      component="section"
      aria-labelledby="empty-heading"
      sx={{
        borderRadius: `${radius.dialog}px`,
        background: sky.background,
        color: sky.textColor,
        px: { xs: 3, sm: 5 },
        py: { xs: 6, sm: 9 },
        minHeight: { xs: 360, md: 420 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <Typography variant="overline" component="p">
        Sunrise · Golden hour · Blue hour
      </Typography>
      <Typography id="empty-heading" variant="h1" component="h2" sx={{ mt: 1.5, maxWidth: 560, textWrap: 'balance' }}>
        Where are you watching the sky from?
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, maxWidth: 520 }}>
        Pick a city or share your position. Everything is calculated on this device, and works offline.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlaceOutlined />}
          onClick={onChooseLocation}
          aria-haspopup="dialog"
          sx={{
            backgroundColor: sky.textColor,
            color: sky.colors[0],
            '&:hover': { backgroundColor: sky.textColor, opacity: 0.92 },
          }}
        >
          Choose a location
        </Button>
      </Box>
    </Box>
  );
}
