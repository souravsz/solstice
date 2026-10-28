import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { validateCoordinate } from '../../lib/location/coordinates.js';

/** Latitude/longitude entry with inline validation. */
export function CoordinatesForm({ initial, onSubmit }) {
  const [values, setValues] = useState(() => ({
    lat: initial ? String(initial.lat) : '',
    lng: initial ? String(initial.lng) : '',
  }));
  const [touched, setTouched] = useState({ lat: false, lng: false });

  const lat = validateCoordinate(values.lat, 'lat');
  const lng = validateCoordinate(values.lng, 'lng');
  const showError = (axis, result) => touched[axis] && result.error !== null;

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ lat: true, lng: true });
    if (lat.error || lng.error) return;
    onSubmit(lat.value, lng.value);
  };

  const field = (axis, label, result, placeholder) => (
    <TextField
      label={label}
      value={values[axis]}
      onChange={(e) => setValues((v) => ({ ...v, [axis]: e.target.value }))}
      onBlur={() => setTouched((t) => ({ ...t, [axis]: true }))}
      error={showError(axis, result)}
      helperText={showError(axis, result) ? result.error : ' '}
      placeholder={placeholder}
      fullWidth
      autoComplete="off"
      slotProps={{ htmlInput: { inputMode: 'decimal', spellCheck: false } }}
    />
  );

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} aria-label="Enter coordinates" sx={{ pt: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 2, rowGap: 0.5 }}>
        {field('lat', 'Latitude', lat, '38.72')}
        {field('lng', 'Longitude', lng, '-9.14')}
      </Box>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Decimal degrees. South and west are negative, or add S / W.
      </Typography>
      <Button type="submit" variant="contained" fullWidth>
        Use these coordinates
      </Button>
    </Box>
  );
}
