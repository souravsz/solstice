import { useId } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { STAT } from '../../lib/summary/cards.js';
import { describeElevation } from '../../lib/summary/describe.js';
import { SunriseIcon, SunsetIcon } from '../icons.jsx';
import { StatItem } from './StatItem.jsx';
import { SunTimeline } from './SunTimeline.jsx';
import { DurationText, TimeText } from './TimeText.jsx';
import { TwilightList } from './TwilightList.jsx';

/**
 * Presentation for each stat. Sunrise and sunset are the primary stats.
 * Material has no separate sunrise/sunset glyphs, so those two use the app's
 * outlined SvgIcons drawn to the same weight.
 */
const STAT_STYLE = {
  [STAT.SUNRISE]: { icon: SunriseIcon, tone: 'golden', emphasis: 'primary' },
  [STAT.SUNSET]: { icon: SunsetIcon, tone: 'golden', emphasis: 'primary' },
  [STAT.SOLAR_NOON]: { icon: LightModeOutlined, tone: 'golden', emphasis: 'secondary' },
  [STAT.DAY_LENGTH]: { icon: ScheduleOutlined, tone: 'blue', emphasis: 'secondary' },
};

const ORDER = [STAT.SUNRISE, STAT.SUNSET, STAT.SOLAR_NOON, STAT.DAY_LENGTH];

function helperFor(stat, changes) {
  switch (stat.id) {
    case STAT.SUNRISE:
      return changes.sunrise;
    case STAT.SUNSET:
      return changes.sunset;
    case STAT.SOLAR_NOON:
      return `Sun ${describeElevation(stat.elevation)}`;
    default:
      return stat.note ?? changes.dayLength;
  }
}

function StatValue({ stat, emphasis, day }) {
  const variant = emphasis === 'primary' ? 'statPrimary' : 'statSecondary';
  const { value } = stat;
  if (value.type === 'message') {
    // A calm sentence where the time doesn't exist (polar day or night).
    return <Typography variant="statMessage">{value.text}</Typography>;
  }
  return (
    <Typography variant={variant}>
      {value.type === 'duration' ? (
        <DurationText ms={value.ms} />
      ) : (
        <TimeText at={value.at} timeZone={day.timeZone} civilDate={day.civilDate} />
      )}
    </Typography>
  );
}

function StatsRow({ day, statusFor }) {
  const byId = Object.fromEntries(day.summary.stats.map((s) => [s.id, s]));
  return (
    <Grid container role="list" spacing={{ xs: 3, md: 4 }}>
      {ORDER.map((id) => {
        const stat = byId[id];
        const style = STAT_STYLE[id];
        return (
          <Grid key={id} size={{ xs: 6, md: 3 }} role="listitem">
            <StatItem
              icon={style.icon}
              label={stat.label}
              tone={style.tone}
              status={statusFor(id)}
              helper={helperFor(stat, day.changes)}
            >
              <StatValue stat={stat} emphasis={style.emphasis} day={day} />
            </StatItem>
          </Grid>
        );
      })}
    </Grid>
  );
}

/**
 * The day's sun times: four stats, the 24-hour timeline, and the golden and blue hours.
 * Content fades in (200 ms) when the date or place changes.
 */
export function SunTimesCard({ day, now, isToday, statusFor }) {
  const headingId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <Card variant="outlined" component="section" aria-labelledby={headingId}>
      <CardContent>
        <Typography id={headingId} variant="cardTitle">
          Sun times
        </Typography>
        <Fade key={`${day.timeZone}|${day.civilDate}`} in appear timeout={reduceMotion ? 0 : 200}>
          <Stack spacing={{ xs: 3, md: 5 }} sx={{ mt: { xs: 2.5, md: 3 } }}>
            <StatsRow day={day} statusFor={statusFor} />
            <SunTimeline day={day} now={now} isToday={isToday} />
            <TwilightList groups={day.summary.windowGroups} day={day} statusFor={statusFor} />
          </Stack>
        </Fade>
      </CardContent>
    </Card>
  );
}
