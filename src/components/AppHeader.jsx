import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import { useColorMode } from '../theme/useColorMode.js';
import { SolsticeMark } from './icons.jsx';

export function AppHeader({ location, onOpenPicker }) {
  const theme = useTheme();
  const { mode, toggle } = useColorMode();
  const nextModeLabel = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Box
      component="header"
      sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, py: { xs: 2, sm: 3 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto', minWidth: 0, color: 'text.primary' }}>
        <SolsticeMark size={28} sunColor={theme.palette.phase.goldenHour} />
        <Typography
          component="h1"
          sx={{ fontFamily: theme.typography.h1.fontFamily, fontSize: '1.375rem', fontWeight: 500, letterSpacing: '-0.01em' }}
        >
          Solstice
        </Typography>
      </Box>

      {location ? (
        <Chip
          icon={<PlaceOutlined fontSize="small" />}
          label={location.name}
          onClick={onOpenPicker}
          aria-label={`Location: ${location.name}. Change location`}
          aria-haspopup="dialog"
          sx={{ maxWidth: { xs: 168, sm: 320 }, height: 40, px: 0.5, fontSize: '0.875rem' }}
        />
      ) : (
        <Button variant="outlined" startIcon={<PlaceOutlined />} onClick={onOpenPicker} aria-haspopup="dialog">
          Choose location
        </Button>
      )}

      <Tooltip title={nextModeLabel}>
        <IconButton
          onClick={toggle}
          aria-label={nextModeLabel}
          sx={{ width: 40, height: 40, border: 1, borderColor: 'divider' }}
        >
          {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
