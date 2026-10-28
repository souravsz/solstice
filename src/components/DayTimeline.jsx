import { useId } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { PHASE, PHASE_LABEL } from '../lib/solar/index.js';
import { formatDuration, formatDurationLong, formatTime, formatTimeRange } from '../lib/time/format.js';
import { VisuallyHidden } from './VisuallyHidden.jsx';

const LEGEND_ORDER = [PHASE.DAY, PHASE.GOLDEN_HOUR, PHASE.BLUE_HOUR, PHASE.NIGHT];

const hourLabel = (date, timeZone) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone }).format(date);

/**
 * A 24-hour bar split into night, blue hour, golden hour and daylight,
 * with a "now" marker when showing today. Day length follows the real clock,
 * so DST change days are 23 or 25 hours wide.
 */
export function DayTimeline({ day, now, isToday }) {
  const theme = useTheme();
  const headingId = useId();
  const { segments, bounds, ticks, timeZone } = day;
  const start = bounds.start.getTime();
  const span = bounds.end.getTime() - start;
  const pct = (date) => ((date.getTime() - start) / span) * 100;
  const fills = theme.palette.phaseFill;

  const totals = Object.fromEntries(LEGEND_ORDER.map((p) => [p, 0]));
  for (const s of segments) totals[s.phase] += s.end - s.start;

  const showNow = isToday && now >= bounds.start && now < bounds.end;
  const nowPct = showNow ? pct(now) : null;

  return (
    <Card component="section" aria-labelledby={headingId} sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography id={headingId} variant="h4" component="h3">
          Light through the day
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {Math.round(span / 3600000) === 24 ? '24 hours, midnight to midnight' : `${Math.round(span / 3600000)} hours today, as the clocks change`}
        </Typography>

        <Box sx={{ mt: 'auto', pt: 4 }}>
          <Box aria-hidden sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                height: 16,
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
              // 22px label area above the 16px bar, plus 6px of overhang below it (not into the hour labels).
              <Box sx={{ position: 'absolute', top: -22, height: 44, left: `${nowPct}%`, transform: 'translateX(-50%)' }}>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
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
                    left: '50%',
                    width: 2,
                    ml: '-1px',
                    borderRadius: 1,
                    backgroundColor: 'text.primary',
                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                  }}
                />
              </Box>
            ) : null}

            <Box sx={{ position: 'relative', height: 20, mt: 1 }}>
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

          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
              mt: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {LEGEND_ORDER.map((p) => (
              <Box component="li" key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
                <Box
                  aria-hidden
                  sx={{
                    width: 10,
                    height: 10,
                    mt: '5px',
                    borderRadius: '3px',
                    backgroundColor: fills[p],
                    boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {PHASE_LABEL[p]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    <span aria-hidden>{formatDuration(totals[p])}</span>
                    <VisuallyHidden>{formatDurationLong(totals[p])}</VisuallyHidden>
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* The bar as a list, for screen readers. */}
        <VisuallyHidden component="ol">
          {segments.map((s) => (
            <li key={`sr-${s.phase}-${s.start.getTime()}`}>
              {PHASE_LABEL[s.phase]}: {formatTimeRange(s.start, s.end, timeZone)}
            </li>
          ))}
          {showNow ? <li>Now: {formatTime(now, timeZone)}</li> : null}
        </VisuallyHidden>
      </CardContent>
    </Card>
  );
}
