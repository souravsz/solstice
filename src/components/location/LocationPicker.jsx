import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRounded from '@mui/icons-material/CloseRounded';
import EditLocationAltOutlined from '@mui/icons-material/EditLocationAltOutlined';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MyLocationOutlined from '@mui/icons-material/MyLocationOutlined';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { CitySearch } from './CitySearch.jsx';
import { CoordinatesForm } from './CoordinatesForm.jsx';
import { LocatingIndicator } from './LocatingIndicator.jsx';

/**
 * Choose where to calculate for: search a built-in city, use the device position,
 * or type coordinates. Everything stays on the device.
 */
export function LocationPicker({
  open,
  onClose,
  location,
  geoStatus,
  onChooseLocation,
  onChooseCoordinates,
  onLocate,
  onExited,
}) {
  const reduceMotion = useReducedMotion();
  const [showCoordinates, setShowCoordinates] = useState(() => location?.source === 'manual');
  const locating = geoStatus.state === 'locating';

  const handleLocate = async () => {
    const result = await onLocate();
    if (result) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="location-picker-title"
      aria-describedby="location-picker-description"
      transitionDuration={reduceMotion ? 0 : undefined}
      slotProps={{ transition: { onExited } }}
    >
      <DialogTitle id="location-picker-title" sx={{ pr: 8 }}>
        {location ? 'Change location' : 'Where are you watching the sky from?'}
      </DialogTitle>
      <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', top: 18, right: 18 }}>
        <CloseRounded />
      </IconButton>

      <DialogContent>
        <Typography id="location-picker-description" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sun times are calculated on this device and your location is saved only here. Searching sends just the
          text you type to Open-Meteo; built-in cities work offline.
        </Typography>

        <CitySearch
          autoFocus
          onSelect={(place) => {
            onChooseLocation(place);
            onClose();
          }}
        />

        <Divider sx={{ my: 3, typography: 'caption', color: 'text.secondary' }}>or</Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<MyLocationOutlined />}
          onClick={handleLocate}
          disabled={locating}
          sx={{ minHeight: 48 }}
        >
          {locating ? 'Finding your position…' : 'Use my location'}
        </Button>
        {locating ? <LocatingIndicator /> : null}
        <Box role="status" aria-live="polite" sx={{ minHeight: 0 }}>
          {geoStatus.state === 'error' ? (
            <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
              {geoStatus.message}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="text"
            onClick={() => setShowCoordinates((v) => !v)}
            aria-expanded={showCoordinates}
            aria-controls="coordinates-panel"
            startIcon={<EditLocationAltOutlined />}
            endIcon={
              <ExpandMore
                sx={{
                  transform: showCoordinates ? 'rotate(180deg)' : 'none',
                  transition: (t) => t.transitions.create('transform', { duration: t.transitions.duration.shorter }),
                }}
              />
            }
            sx={{ ml: -1 }}
          >
            Enter coordinates
          </Button>
          <Collapse in={showCoordinates} id="coordinates-panel" timeout={reduceMotion ? 0 : 'auto'}>
            <CoordinatesForm
              initial={location?.source === 'manual' ? location : null}
              onSubmit={(lat, lng) => {
                onChooseCoordinates(lat, lng);
                onClose();
              }}
            />
          </Collapse>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
