import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CARD } from '../lib/summary/cards.js';
import { describeElevation } from '../lib/summary/describe.js';
import { formatDuration, formatDurationLong } from '../lib/time/format.js';
import { TimeCard } from './TimeCard.jsx';
import { TimeRange, TimeValue } from './TimeValue.jsx';
import { VisuallyHidden } from './VisuallyHidden.jsx';
import {
  BlueHourIcon,
  DayLengthIcon,
  GoldenHourIcon,
  SolarNoonIcon,
  SunriseIcon,
  SunsetIcon,
} from './icons.jsx';

const ICONS = {
  [CARD.SUNRISE]: SunriseIcon,
  [CARD.SUNSET]: SunsetIcon,
  [CARD.SOLAR_NOON]: SolarNoonIcon,
  [CARD.GOLDEN_MORNING]: GoldenHourIcon,
  [CARD.GOLDEN_EVENING]: GoldenHourIcon,
  [CARD.BLUE_HOURS]: BlueHourIcon,
  [CARD.DAY_LENGTH]: DayLengthIcon,
};

/** A calm sentence in place of a time that doesn't happen today. */
function Message({ children }) {
  return (
    <Typography variant="h4" component="p" sx={{ fontWeight: 400, textWrap: 'balance' }}>
      {children}
    </Typography>
  );
}

function Note({ children }) {
  if (!children) return null;
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
      {children}
    </Typography>
  );
}

/** One golden or blue hour period, in a large or compact style. */
function Band({ view, timeZone, civilDate, compact = false }) {
  const variant = compact ? 'timeInline' : 'timeCard';
  const component = compact ? 'span' : 'p';
  switch (view.kind) {
    case 'range': {
      const duration = view.end - view.start;
      return (
        <>
          <TimeRange
            start={view.start}
            end={view.end}
            timeZone={timeZone}
            civilDate={civilDate}
            variant={variant}
            component={component}
          />
          {compact ? null : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              <span aria-hidden>{formatDuration(duration)}</span>
              <VisuallyHidden>{formatDurationLong(duration)}</VisuallyHidden>
            </Typography>
          )}
        </>
      );
    }
    case 'from':
    case 'until': {
      const at = view.kind === 'from' ? view.start : view.end;
      const word = view.kind === 'from' ? 'From' : 'Until';
      return (
        <>
          <Box component={component} sx={{ display: compact ? 'inline' : 'flex', alignItems: 'baseline', gap: 1, m: 0 }}>
            <Typography component="span" variant={compact ? 'timeInline' : 'body1'} sx={{ fontWeight: 500 }}>
              {word}
            </Typography>{' '}
            <TimeValue at={at} timeZone={timeZone} civilDate={civilDate} variant={variant} component="span" />
          </Box>
          {compact ? null : <Note>{view.note}</Note>}
        </>
      );
    }
    default:
      return compact ? (
        <Typography component="span" variant="body2" color="text.secondary">
          {view.note}
        </Typography>
      ) : (
        <Message>{view.note}</Message>
      );
  }
}

function CardBody({ card, day }) {
  const { timeZone, civilDate } = day;
  const { value } = card;
  switch (value.type) {
    case 'time':
      return (
        <>
          <TimeValue at={value.at} timeZone={timeZone} civilDate={civilDate} />
          {card.id === CARD.SOLAR_NOON ? <Note>Sun {describeElevation(card.elevation)}</Note> : null}
        </>
      );
    case 'message':
      return <Message>{value.text}</Message>;
    case 'band':
      return <Band view={value.view} timeZone={timeZone} civilDate={civilDate} />;
    case 'bands':
      return (
        <Box component="dl" sx={{ m: 0 }}>
          {value.rows.map(({ label, view }, i) => (
            <Box
              key={label}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 2,
                py: 1,
                borderTop: i === 0 ? 0 : 1,
                borderColor: 'divider',
              }}
            >
              <Typography component="dt" variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                {label}
              </Typography>
              <Box component="dd" sx={{ m: 0, textAlign: 'right' }}>
                <Band view={view} timeZone={timeZone} civilDate={civilDate} compact />
              </Box>
            </Box>
          ))}
        </Box>
      );
    case 'duration':
      return (
        <>
          <Typography variant="timeCard" component="p">
            <span aria-hidden>{formatDuration(value.ms)}</span>
            <VisuallyHidden>{formatDurationLong(value.ms)}</VisuallyHidden>
          </Typography>
          <Note>{card.note}</Note>
          {day.comparisons.length > 0 ? (
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
              {day.comparisons.map((line) => (
                <Typography key={line} component="li" variant="body2" color="text.secondary" sx={{ py: 0.25 }}>
                  {line}
                </Typography>
              ))}
            </Box>
          ) : null}
        </>
      );
    default:
      return null;
  }
}

/** Renders any sun card view model from lib/summary/cards.js. */
export function SunCard({ card, day, status }) {
  return (
    <TimeCard icon={ICONS[card.id]} label={card.label} phase={card.phase} status={status}>
      <CardBody card={card} day={day} />
    </TimeCard>
  );
}
