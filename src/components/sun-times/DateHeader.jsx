import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { formatDateHeading, formatRelativeDay, formatTimeZoneOffset, timeZoneCity } from '../../lib/time/format.js';
import { addCivilDays, civilNoon, getDeviceTimeZone, parseCivilDate } from '../../lib/time/zoned.js';

export const MIN_DATE = '1900-01-01';
export const MAX_DATE = '2100-12-31';

/** NOAA's equations are accurate to about a minute between 1900 and 2100. */
const isSupported = (value) => parseCivilDate(value) !== null && value >= MIN_DATE && value <= MAX_DATE;

const stepButton = { width: 32, height: 32, flexShrink: 0 };

/**
 * Overline + date title on the left; one grouped control (previous, date, next, Today)
 * on the right, or full width below the title on phones.
 * `onChange(null)` means "follow today".
 */
export function DateHeader({ civilDate, today, timeZone, onChange }) {
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
    <Stack
      component="section"
      aria-labelledby="date-heading"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-end' } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" component="p" sx={{ color: 'text.secondary', display: 'block' }}>
          {formatRelativeDay(civilDate, today)}
          {showZone
            ? ` · Times in ${timeZoneCity(timeZone)} (${formatTimeZoneOffset(civilNoon(civilDate, timeZone), timeZone)})`
            : ''}
        </Typography>
        <Typography id="date-heading" variant="dateTitle" sx={{ mt: 0.5 }}>
          {formatDateHeading(civilDate, today)}
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        role="group"
        aria-label="Change date"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          height: 40,
          px: 0.5,
          borderRadius: 1,
          flexShrink: 0,
          width: { xs: '100%', sm: 'auto' },
          boxSizing: 'border-box',
        }}
      >
        <IconButton aria-label="Previous day" onClick={() => go(-1)} disabled={civilDate <= MIN_DATE} sx={stepButton}>
          <ChevronLeft fontSize="small" />
        </IconButton>
        <InputBase
          type="date"
          value={draft}
          onChange={(event) => {
            const value = event.target.value;
            setDraft(value);
            if (isSupported(value)) onChange(value === today ? null : value);
          }}
          onBlur={() => setDraft(civilDate)}
          inputProps={{ min: MIN_DATE, max: MAX_DATE, 'aria-label': 'Date' }}
          sx={{
            flex: { xs: 1, sm: 'none' },
            minWidth: 0,
            width: { sm: 136 },
            typography: 'timeRange',
            '& input': { px: 0.5, py: 0, height: 32, textAlign: 'center' },
          }}
        />
        <IconButton aria-label="Next day" onClick={() => go(1)} disabled={civilDate >= MAX_DATE} sx={stepButton}>
          <ChevronRight fontSize="small" />
        </IconButton>
        {/* Tonal, and never disabled: disabling would drop keyboard focus right after pressing it. */}
        <Button
          size="small"
          onClick={() => onChange(null)}
          aria-current={isToday ? 'date' : undefined}
          sx={{
            ml: 0.5,
            minHeight: 32,
            height: 32,
            px: 1.5,
            borderRadius: 0.8,
            flexShrink: 0,
            color: isToday ? 'text.secondary' : 'text.primary',
            bgcolor: isToday ? 'transparent' : 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          Today
        </Button>
      </Paper>
    </Stack>
  );
}
