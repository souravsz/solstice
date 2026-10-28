import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '../../lib/color/color.js';
import { formatDuration, formatDurationLong } from '../../lib/time/format.js';
import { VisuallyHidden } from '../VisuallyHidden.jsx';
import { SoftChip } from './SoftChip.jsx';
import { toneForPhase } from './tone.js';
import { TimeRangeText, TimeText } from './TimeText.jsx';

const STATUS_TEXT = { next: 'Next', now: 'Now' };

function RowValue({ view, day }) {
  const { timeZone, civilDate } = day;
  if (view.kind === 'range') {
    return (
      <Typography variant="timeRange" sx={{ textAlign: 'right' }}>
        <TimeRangeText start={view.start} end={view.end} timeZone={timeZone} civilDate={civilDate} />
      </Typography>
    );
  }
  if (view.kind === 'from' || view.kind === 'until') {
    const at = view.kind === 'from' ? view.start : view.end;
    return (
      <Typography variant="timeRange" sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {view.kind === 'from' ? 'From ' : 'Until '}
        </Box>
        <TimeText at={at} timeZone={timeZone} civilDate={civilDate} size="small" />
      </Typography>
    );
  }
  // No window today (polar day or night): a short, calm note.
  return (
    <Typography variant="statHelper" sx={{ color: 'text.secondary', textAlign: 'right' }}>
      {view.note}
    </Typography>
  );
}

function TwilightRow({ row, day, status }) {
  const tone = toneForPhase(row.phase);
  const duration = row.view.kind === 'range' ? row.view.end - row.view.start : null;

  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 28 }}>
      <Box
        aria-hidden
        sx={(theme) => ({
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          bgcolor: theme.palette.sun[tone],
          // A soft halo marks the next or current window, at every screen size.
          boxShadow: status ? `0 0 0 4px ${alpha(theme.palette.sun[tone], 0.22)}` : 'none',
        })}
      />
      <Typography variant="rowLabel" sx={{ whiteSpace: 'nowrap' }}>
        {row.label}
        {status ? <VisuallyHidden>, {STATUS_TEXT[status].toLowerCase()}</VisuallyHidden> : null}
      </Typography>
      {status ? (
        <SoftChip tone={tone} label={STATUS_TEXT[status]} aria-hidden sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
      ) : null}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <RowValue view={row.view} day={day} />
        {duration !== null ? (
          <SoftChip
            tone={tone}
            label={
              <>
                <span aria-hidden>{formatDuration(duration)}</span>
                <VisuallyHidden>, {formatDurationLong(duration)}</VisuallyHidden>
              </>
            }
            sx={{ minWidth: 48 }}
          />
        ) : null}
      </Box>
    </Box>
  );
}

/**
 * Golden and blue hours grouped by part of the day ("Morning", "Evening", and
 * "Around midday" / "All day" at high latitudes). Rows are separated by space only.
 */
export function TwilightList({ groups, day, statusFor }) {
  const columns = Math.min(groups.length, 3);
  // Three groups only sit side by side once there is room for full rows.
  const repeat = (n) => `repeat(${n}, minmax(0, 1fr))`;

  return (
    <Box
      role="list"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: repeat(columns === 3 ? 1 : columns), lg: repeat(columns) },
        columnGap: { sm: 4, md: 5 },
        rowGap: 3,
      }}
    >
      {groups.map((group) => (
        <Box key={group.id} role="listitem" aria-labelledby={`twilight-${group.id}`} sx={{ minWidth: 0 }}>
          <Typography id={`twilight-${group.id}`} variant="overline" component="h4" sx={{ color: 'text.secondary', display: 'block' }}>
            {group.label}
          </Typography>
          <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0, mt: 1.5 }}>
            {group.rows.map((row) => (
              <TwilightRow key={row.id} row={row} day={day} status={statusFor(row.id)} />
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
