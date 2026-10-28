import Box from '@mui/material/Box';
import { formatDuration, formatDurationLong, formatTimeParts } from '../../lib/time/format.js';
import { civilDateOf, diffCivilDays } from '../../lib/time/zoned.js';
import { VisuallyHidden } from '../VisuallyHidden.jsx';

/**
 * Inline time pieces. They render inside a Typography supplied by the caller, so
 * size and weight come from that variant; the suffixes scale relative to it.
 */

/** am/pm sits small beside big numbers; h/m units need a little more size to stay legible. */
const SUFFIX_SCALE = { large: '0.42em', small: '0.86em', unit: '0.6em' };

/** am/pm or h/m units: smaller and muted, sitting on the number's baseline. */
function Suffix({ children, size }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: SUFFIX_SCALE[size],
        fontWeight: 500,
        letterSpacing: 0,
        color: 'text.secondary',
        ml: '0.2em',
        textTransform: 'lowercase',
      }}
    >
      {children}
    </Box>
  );
}

/** "+1" when an event falls on the next calendar day (late twilight in summer, for example). */
function DayOffset({ at, civilDate, timeZone }) {
  if (!civilDate) return null;
  const offset = diffCivilDays(civilDate, civilDateOf(at, timeZone));
  if (offset === 0) return null;
  return (
    <Box component="sup" sx={{ fontSize: '0.5em', fontWeight: 600, color: 'text.secondary', ml: '0.2em' }}>
      <span aria-hidden>{offset > 0 ? `+${offset}` : `−${Math.abs(offset)}`}</span>
      <VisuallyHidden>{offset > 0 ? ' (next day)' : ' (previous day)'}</VisuallyHidden>
    </Box>
  );
}

/** "6:14 am" */
export function TimeText({ at, timeZone, civilDate, size = 'large' }) {
  const { time, period } = formatTimeParts(at, timeZone);
  return (
    <>
      <time dateTime={at.toISOString()}>
        {time}
        {period ? <Suffix size={size}>{period}</Suffix> : null}
      </time>
      <DayOffset at={at} civilDate={civilDate} timeZone={timeZone} />
    </>
  );
}

/** "6:31 – 6:42 am": the period is shown once when both ends share it. */
export function TimeRangeText({ start, end, timeZone, civilDate, size = 'small' }) {
  const a = formatTimeParts(start, timeZone);
  const b = formatTimeParts(end, timeZone);
  const shared = a.period && a.period === b.period;
  return (
    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
      <time dateTime={start.toISOString()}>
        {a.time}
        {a.period && !shared ? <Suffix size={size}>{a.period}</Suffix> : null}
      </time>
      <DayOffset at={start} civilDate={civilDate} timeZone={timeZone} />
      <Box component="span" aria-hidden sx={{ mx: '0.3em', color: 'text.secondary' }}>
        –
      </Box>
      <VisuallyHidden> to </VisuallyHidden>
      <time dateTime={end.toISOString()}>
        {b.time}
        {b.period ? <Suffix size={size}>{b.period}</Suffix> : null}
      </time>
      <DayOffset at={end} civilDate={civilDate} timeZone={timeZone} />
    </Box>
  );
}

/** "11h 48m" with the units set like am/pm; read out as "11 hours 48 minutes". */
export function DurationText({ ms, size = 'unit' }) {
  const parts = [...formatDuration(ms).matchAll(/(\d+)([hm])/g)];
  return (
    <>
      <Box component="span" aria-hidden>
        {parts.map(([, value, unit], i) => (
          <Box component="span" key={unit} sx={{ ml: i > 0 ? '0.25em' : 0, '& > span': { ml: '0.06em' } }}>
            {value}
            <Suffix size={size}>{unit}</Suffix>
          </Box>
        ))}
      </Box>
      <VisuallyHidden>{formatDurationLong(ms)}</VisuallyHidden>
    </>
  );
}
