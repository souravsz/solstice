import { useId } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { alpha } from '../lib/color/color.js';
import { STAT } from '../lib/summary/cards.js';
import { describeElevation } from '../lib/summary/describe.js';
import { formatDuration, formatDurationLong } from '../lib/time/format.js';
import { DayBar } from './DayBar.jsx';
import { TimeRange, TimeValue } from './TimeValue.jsx';
import { VisuallyHidden } from './VisuallyHidden.jsx';
import { DayLengthIcon, SolarNoonIcon, SunriseIcon, SunsetIcon } from './icons.jsx';

const ICONS = {
  [STAT.SUNRISE]: SunriseIcon,
  [STAT.SOLAR_NOON]: SolarNoonIcon,
  [STAT.SUNSET]: SunsetIcon,
  [STAT.DAY_LENGTH]: DayLengthIcon,
};

const STATUS_TEXT = { next: 'Next', now: 'Now' };

/** Small "Next" / "Now" pill in the item's phase colour. */
function StatusPill({ status, accent }) {
  const theme = useTheme();
  if (!status) return null;
  return (
    <Box
      component="span"
      sx={{
        px: 0.875,
        py: 0.125,
        borderRadius: 999,
        fontSize: '0.6875rem',
        fontWeight: 600,
        lineHeight: 1.45,
        flexShrink: 0,
        color: status === 'next' ? theme.palette.surface.onInk : accent,
        backgroundColor: status === 'next' ? accent : 'transparent',
        border: `1px solid ${accent}`,
      }}
    >
      {STATUS_TEXT[status]}
    </Box>
  );
}

/** A faint wash of the accent colour, layered over the surface so it stays opaque. */
const tint = (accent, mode) => ({
  backgroundImage: `linear-gradient(${alpha(accent, mode === 'light' ? 0.06 : 0.1)}, ${alpha(accent, mode === 'light' ? 0.06 : 0.1)})`,
});

function Note({ children }) {
  if (!children) return null;
  return (
    <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
      {children}
    </Typography>
  );
}

function StatValue({ stat, day }) {
  const { value } = stat;
  if (value.type === 'time') return <TimeValue at={value.at} timeZone={day.timeZone} civilDate={day.civilDate} />;
  if (value.type === 'duration') {
    return (
      <Typography variant="timeCard" component="p">
        <span aria-hidden>{formatDuration(value.ms)}</span>
        <VisuallyHidden>{formatDurationLong(value.ms)}</VisuallyHidden>
      </Typography>
    );
  }
  // A calm sentence where a time doesn't exist (polar day or night).
  return (
    <Typography variant="h4" component="p" sx={{ fontWeight: 400, lineHeight: 1.3, minHeight: { sm: '2.4rem' } }}>
      {value.text}
    </Typography>
  );
}

function statNote(stat, day) {
  switch (stat.id) {
    case STAT.SUNRISE:
      return day.changes.sunrise;
    case STAT.SUNSET:
      return day.changes.sunset;
    case STAT.SOLAR_NOON:
      return `Sun ${describeElevation(stat.elevation)}`;
    default:
      return stat.note ?? day.changes.dayLength;
  }
}

function StatCell({ stat, day, status }) {
  const theme = useTheme();
  const accent = theme.palette.phase[stat.phase];
  const Icon = ICONS[stat.id];
  return (
    <Box
      component="li"
      sx={{
        position: 'relative',
        listStyle: 'none',
        backgroundColor: 'background.paper',
        ...(status === 'next' ? tint(accent, theme.palette.mode) : null),
        px: { xs: 2, sm: 3 },
        pt: { xs: 2.25, sm: 2.75 },
        pb: { xs: 2, sm: 2.5 },
        minWidth: 0,
        // The thin phase accent line, as on every card.
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: { xs: 16, sm: 24 },
          width: 24,
          height: status ? 3 : 2,
          borderRadius: '0 0 3px 3px',
          backgroundColor: accent,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, minHeight: 22 }}>
        <Icon fontSize="small" aria-hidden sx={{ color: accent, fontSize: 18 }} />
        <Typography component="h4" variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mr: 'auto' }}>
          {stat.label}
        </Typography>
        <StatusPill status={status} accent={accent} />
      </Box>
      <StatValue stat={stat} day={day} />
      <Note>{statNote(stat, day)}</Note>
    </Box>
  );
}

/** One golden or blue hour row: colour mark, name, time range and duration. */
function WindowRow({ row, day, status }) {
  const theme = useTheme();
  const accent = theme.palette.phase[row.phase];
  const { view } = row;
  const { timeZone, civilDate } = day;

  let value;
  let duration = null;
  if (view.kind === 'range') {
    value = <TimeRange start={view.start} end={view.end} timeZone={timeZone} civilDate={civilDate} variant="timeInline" component="span" />;
    duration = view.end - view.start;
  } else if (view.kind === 'from' || view.kind === 'until') {
    value = (
      <Typography component="span" variant="timeInline">
        {view.kind === 'from' ? 'From ' : 'Until '}
        <TimeValue at={view.kind === 'from' ? view.start : view.end} timeZone={timeZone} civilDate={civilDate} variant="timeInline" component="span" />
      </Typography>
    );
  } else {
    value = (
      <Typography component="span" variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
        {view.note}
      </Typography>
    );
  }

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        minHeight: 44,
        px: 1.5,
        mx: -1.5,
        borderRadius: '10px',
        ...(status === 'next' ? tint(accent, theme.palette.mode) : null),
        boxShadow: status === 'next' ? `inset 0 0 0 1px ${alpha(accent, 0.5)}` : 'none',
      }}
    >
      <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: accent, flexShrink: 0 }} />
      <Typography component="span" variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
        {row.label}
        {status ? <VisuallyHidden>, {STATUS_TEXT[status].toLowerCase()}</VisuallyHidden> : null}
      </Typography>
      {/* On phones the tinted outline marks the row; the pill would crowd the times. */}
      <Box aria-hidden sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
        <StatusPill status={status} accent={accent} />
      </Box>
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'baseline', gap: 1.25, minWidth: 0, justifyContent: 'flex-end' }}>
        {value}
        {duration !== null ? (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: '3.2em', textAlign: 'right' }}>
            <span aria-hidden>{formatDuration(duration)}</span>
            <VisuallyHidden>, {formatDurationLong(duration)}</VisuallyHidden>
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * All of the day's sun times in one card: the four key times, the 24-hour bar,
 * and the golden and blue hours grouped by part of the day.
 */
export function DaySummary({ day, now, isToday, statusFor }) {
  const headingId = useId();
  const { stats, windowGroups } = day.summary;

  return (
    <Card component="section" aria-labelledby={headingId}>
      <Typography id={headingId} variant="h4" component="h3" sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.25, sm: 2.75 }, pb: { xs: 1.75, sm: 2.25 } }}>
        Sun times
      </Typography>

      {/* Hairline grid: a 1px gap over the divider colour draws the lines between cells. */}
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          gap: '1px',
          backgroundColor: 'divider',
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {stats.map((stat) => (
          <StatCell key={stat.id} stat={stat} day={day} status={statusFor(stat.id)} />
        ))}
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: { xs: 2, sm: 2.5 } }}>
        <DayBar day={day} now={now} isToday={isToday} />

        <Box
          sx={{
            mt: { xs: 2, sm: 2.5 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: `repeat(${Math.min(windowGroups.length, 3)}, minmax(0, 1fr))` },
            columnGap: { sm: 4, md: 5 },
            rowGap: 1.5,
          }}
        >
          {windowGroups.map((group) => (
            <Box key={group.id} component="section" aria-label={group.label} sx={{ minWidth: 0 }}>
              <Typography variant="overline" component="h4" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                {group.label}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {group.rows.map((row) => (
                  <WindowRow key={row.id} row={row} day={day} status={statusFor(row.id)} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
