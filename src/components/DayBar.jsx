import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { PHASE_LABEL } from '../lib/solar/index.js';
import { formatTime, formatTimeRange } from '../lib/time/format.js';
import { VisuallyHidden } from './VisuallyHidden.jsx';

const hourLabel = (date, timeZone) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone }).format(date);

/**
 * A 24-hour bar split into night, blue hour, golden hour and daylight, with a
 * "now" marker when showing today. Width follows the real clock, so DST change
 * days are 23 or 25 hours wide.
 */
export function DayBar({ day, now, isToday }) {
  const theme = useTheme();
  const { segments, bounds, ticks, timeZone } = day;
  const start = bounds.start.getTime();
  const span = bounds.end.getTime() - start;
  const pct = (date) => ((date.getTime() - start) / span) * 100;
  const fills = theme.palette.phaseFill;
  const hours = Math.round(span / 3600000);

  const showNow = isToday && now >= bounds.start && now < bounds.end;
  const nowPct = showNow ? pct(now) : null;

  return (
    <Box>
      <Box aria-hidden sx={{ position: 'relative', pt: showNow ? 2.75 : 0 }}>
        <Box
          sx={{
            display: 'flex',
            height: 12,
            borderRadius: 999,
            overflow: 'hidden',
            boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
          }}
        >
          {segments.map((s) => (
            <Box
              key={`${s.phase}-${s.start.getTime()}`}
              sx={{ width: `${pct(s.end) - pct(s.start)}%`, backgroundColor: fills[s.phase], flexShrink: 0 }}
            />
          ))}
        </Box>

        {nowPct !== null ? (
          // Label above the bar, line through it with a little overhang (not into the hour labels).
          <Box sx={{ position: 'absolute', top: 0, height: 22 + 12 + 4, left: `${nowPct}%` }}>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translateX(${nowPct < 6 ? '-15%' : nowPct > 94 ? '-85%' : '-50%'})`,
                fontWeight: 600,
                lineHeight: 1,
                color: 'text.primary',
                whiteSpace: 'nowrap',
              }}
            >
              Now
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                bottom: 0,
                left: -1,
                width: 2,
                borderRadius: 1,
                backgroundColor: 'text.primary',
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              }}
            />
          </Box>
        ) : null}

        <Box sx={{ position: 'relative', height: 18, mt: 0.75 }}>
          {ticks.map((tick, i) => (
            <Typography
              key={tick.getTime()}
              variant="caption"
              color="text.secondary"
              sx={{
                position: 'absolute',
                left: `${pct(tick)}%`,
                transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {hourLabel(tick, timeZone)}
            </Typography>
          ))}
        </Box>
      </Box>

      {hours !== 24 ? (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
          {hours}-hour day: the clocks change today
        </Typography>
      ) : null}

      {/* The bar as a list, for screen readers. */}
      <VisuallyHidden component="ol">
        {segments.map((s) => (
          <li key={`sr-${s.phase}-${s.start.getTime()}`}>
            {PHASE_LABEL[s.phase]}: {formatTimeRange(s.start, s.end, timeZone)}
          </li>
        ))}
        {showNow ? <li>Now: {formatTime(now, timeZone)}</li> : null}
      </VisuallyHidden>
    </Box>
  );
}
