import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatTimeParts } from '../lib/time/format.js';
import { civilDateOf, diffCivilDays } from '../lib/time/zoned.js';
import { VisuallyHidden } from './VisuallyHidden.jsx';

/** AM/PM, set smaller and in Inter so the numerals carry the weight. */
function Period({ children, inline = false }) {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: 'fontFamily',
        fontSize: inline ? '0.8em' : '0.42em',
        fontWeight: 600,
        letterSpacing: '0.02em',
        ml: '0.3em',
        verticalAlign: '0.1em',
      }}
    >
      {children}
    </Box>
  );
}

/** "+1" when an event falls on the next calendar day (late golden hour in summer, for example). */
function DayOffset({ at, civilDate, timeZone }) {
  if (!civilDate) return null;
  const offset = diffCivilDays(civilDate, civilDateOf(at, timeZone));
  if (offset === 0) return null;
  return (
    <Box
      component="sup"
      title={offset > 0 ? 'Next day' : 'Previous day'}
      sx={{ fontFamily: 'fontFamily', fontSize: '0.4em', fontWeight: 600, ml: '0.2em', color: 'text.secondary' }}
    >
      {offset > 0 ? `+${offset}` : `−${Math.abs(offset)}`}
      <VisuallyHidden>{offset > 0 ? ' (next day)' : ' (previous day)'}</VisuallyHidden>
    </Box>
  );
}

/** A single time, e.g. "6:41 AM", with tabular numerals. */
export function TimeValue({ at, timeZone, civilDate, variant = 'timeCard', component = 'p', sx }) {
  const { time, period } = formatTimeParts(at, timeZone);
  return (
    <Typography variant={variant} component={component} sx={sx}>
      <time dateTime={at.toISOString()}>
        {time}
        {period ? <Period inline={variant === 'timeInline'}>{period}</Period> : null}
      </time>
      <DayOffset at={at} civilDate={civilDate} timeZone={timeZone} />
    </Typography>
  );
}

/** "6:41 – 7:24 AM": the period is shown once when both ends share it. */
export function TimeRange({ start, end, timeZone, civilDate, variant = 'timeCard', component = 'p', sx }) {
  const a = formatTimeParts(start, timeZone);
  const b = formatTimeParts(end, timeZone);
  const shared = a.period && a.period === b.period;
  return (
    <Typography variant={variant} component={component} sx={{ whiteSpace: 'nowrap', ...sx }}>
      <time dateTime={start.toISOString()}>
        {a.time}
        {a.period && !shared ? <Period inline={variant === 'timeInline'}>{a.period}</Period> : null}
      </time>
      <DayOffset at={start} civilDate={civilDate} timeZone={timeZone} />
      <Box component="span" aria-hidden sx={{ mx: '0.25em', opacity: 0.6 }}>
        –
      </Box>
      <VisuallyHidden> to </VisuallyHidden>
      <time dateTime={end.toISOString()}>
        {b.time}
        {b.period ? <Period inline={variant === 'timeInline'}>{b.period}</Period> : null}
      </time>
      <DayOffset at={end} civilDate={civilDate} timeZone={timeZone} />
    </Typography>
  );
}
