import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { formatDateHeading, formatRelativeDay, formatTimeZoneOffset, timeZoneCity } from '../lib/time/format.js';
import { addCivilDays, civilNoon, getDeviceTimeZone, parseCivilDate } from '../lib/time/zoned.js';

export const MIN_DATE = '1900-01-01';
export const MAX_DATE = '2100-12-31';

/** NOAA's equations are accurate to about a minute between 1900 and 2100. */
const isSupported = (value) => parseCivilDate(value) !== null && value >= MIN_DATE && value <= MAX_DATE;

const framed = { width: 40, height: 40, border: 1, borderColor: 'divider', flexShrink: 0 };

/**
 * Previous / next day, a native date input and a "Today" shortcut.
 * `onChange(null)` means "follow today".
 */
export function DateNav({ civilDate, today, timeZone, onChange }) {
  // Keep a draft so typing into the native input isn't fought by the controlled value.
  const [draft, setDraft] = useState(civilDate);
  const [syncedDate, setSyncedDate] = useState(civilDate);
  if (syncedDate !== civilDate) {
    setSyncedDate(civilDate);
    setDraft(civilDate);
  }

  const isToday = civilDate === today;
  const go = (days) => {
    const next = addCivilDays(civilDate, days);
    if (isSupported(next)) onChange(next === today ? null : next);
  };

  const showZone = timeZone !== getDeviceTimeZone();

  return (
    <Box
      component="section"
      aria-labelledby="date-heading"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: { xs: 'stretch', md: 'flex-end' },
        justifyContent: 'space-between',
        gap: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" component="p" color="text.secondary">
          {formatRelativeDay(civilDate, today)}
          {showZone ? ` · Times in ${timeZoneCity(timeZone)} (${formatTimeZoneOffset(civilNoon(civilDate, timeZone), timeZone)})` : ''}
        </Typography>
        <Typography id="date-heading" variant="h2" component="h2">
          {formatDateHeading(civilDate, today)}
        </Typography>
      </Box>

      <Box
        role="group"
        aria-label="Change date"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}
      >
        <IconButton aria-label="Previous day" onClick={() => go(-1)} disabled={civilDate <= MIN_DATE} sx={framed}>
          <ChevronLeft />
        </IconButton>
        <TextField
          type="date"
          size="small"
          value={draft}
          onChange={(event) => {
            const value = event.target.value;
            setDraft(value);
            if (isSupported(value)) onChange(value === today ? null : value);
          }}
          onBlur={() => setDraft(civilDate)}
          slotProps={{ htmlInput: { min: MIN_DATE, max: MAX_DATE, 'aria-label': 'Date' } }}
          sx={{
            flex: { xs: 1, sm: 'none' },
            minWidth: 0,
            width: { sm: 172 },
            '& input': { fontVariantNumeric: 'tabular-nums', minHeight: 23 },
          }}
        />
        <IconButton aria-label="Next day" onClick={() => go(1)} disabled={civilDate >= MAX_DATE} sx={framed}>
          <ChevronRight />
        </IconButton>
        {/* Not disabled on today: disabling would drop keyboard focus right after pressing it. */}
        <Button
          variant="outlined"
          onClick={() => onChange(null)}
          aria-current={isToday ? 'date' : undefined}
          sx={{ flexShrink: 0, opacity: isToday ? 0.6 : 1 }}
        >
          Today
        </Button>
      </Box>
    </Box>
  );
}
