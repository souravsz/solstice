import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { PHASE_LABEL } from '../../lib/solar/index.js';
import { buildTimelineGradient } from '../../lib/sky/timelineGradient.js';
import { formatTime, formatTimeRange } from '../../lib/time/format.js';
import { VisuallyHidden } from '../VisuallyHidden.jsx';

const hourLabel = (date, timeZone) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone }).format(date);

/**
 * The day as one 8px bar whose gradient follows the real phase boundaries,
 * with a "now" dot when showing today and hour ticks below. Width follows the
 * real clock, so DST change days are 23 or 25 hours wide.
 */
export function SunTimeline({ day, now, isToday }) {
  const theme = useTheme();
  const { segments, bounds, ticks, timeZone } = day;
  const { sun } = theme.palette;
  const start = bounds.start.getTime();
  const span = bounds.end.getTime() - start;
  const pct = (date) => ((date.getTime() - start) / span) * 100;
  const hours = Math.round(span / 3600000);

  const gradient = useMemo(
    () =>
      buildTimelineGradient(segments, bounds, {
        night: sun.night,
        blueHour: sun.blue,
        goldenHour: sun.golden,
        day: sun.day,
      }),
    [segments, bounds, sun],
  );

  const showNow = isToday && now >= bounds.start && now < bounds.end;

  return (
    <Box>
      <Box aria-hidden sx={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', height: 8, borderRadius: '999px', background: gradient }} />

        {/* Invisible hover targets, one per segment, for the tooltips. */}
        {segments.map((s) => (
          <Tooltip
            key={`${s.phase}-${s.start.getTime()}`}
            title={`${PHASE_LABEL[s.phase]} · ${formatTimeRange(s.start, s.end, timeZone)}`}
            placement="top"
            disableInteractive
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${pct(s.start)}%`,
                width: `${pct(s.end) - pct(s.start)}%`,
              }}
            />
          </Tooltip>
        ))}

        {showNow ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: `${pct(now)}%`,
              width: 12,
              height: 12,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'text.primary',
              boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 1px 3px ${theme.palette.divider}`,
              pointerEvents: 'none',
            }}
          />
        ) : null}
      </Box>

      <Box aria-hidden sx={{ position: 'relative', height: 16, mt: 1 }}>
        {ticks.map((tick, i) => (
          <Typography
            key={tick.getTime()}
            variant="tick"
            sx={{
              position: 'absolute',
              left: `${pct(tick)}%`,
              transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {hourLabel(tick, timeZone)}
          </Typography>
        ))}
      </Box>

      {hours !== 24 ? (
        <Typography variant="statHelper" component="p" sx={{ color: 'text.secondary', mt: 1 }}>
          {hours}-hour day: the clocks change on this date
        </Typography>
      ) : null}

      {/* The bar as text, for screen readers. */}
      <VisuallyHidden component="div">
        <p>Light through the day:</p>
        <ol>
          {segments.map((s) => (
            <li key={`sr-${s.phase}-${s.start.getTime()}`}>
              {PHASE_LABEL[s.phase]}, {formatTimeRange(s.start, s.end, timeZone)}
            </li>
          ))}
        </ol>
        {showNow ? <p>Now: {formatTime(now, timeZone)}</p> : null}
      </VisuallyHidden>
    </Box>
  );
}
