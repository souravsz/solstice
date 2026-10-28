import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { PHASE_LABEL } from '../lib/solar/index.js';
import { skyGradient } from '../lib/sky/skyGradient.js';
import { compassPoint, describeElevation, describeNextEvent } from '../lib/summary/describe.js';
import { formatTimeParts, formatTimeZoneOffset } from '../lib/time/format.js';
import { getDeviceTimeZone } from '../lib/time/zoned.js';
import { radius } from '../theme/tokens.js';
import { VisuallyHidden } from './VisuallyHidden.jsx';

/**
 * The hero: a sky whose colour comes from the sun's real elevation right now,
 * with the current phase, the local time and what happens next.
 */
export function SkyPanel({ now, sun, location }) {
  const theme = useTheme();
  const { elevation, azimuth } = sun.position;
  const sky = useMemo(() => skyGradient(elevation), [elevation]);
  const { time, period } = formatTimeParts(now, location.timeZone);
  const next = describeNextEvent(sun.next, now, sun.phase);
  const remoteZone = location.timeZone !== getDeviceTimeZone();

  return (
    <Box
      component="section"
      aria-labelledby="sky-phase"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        borderRadius: `${radius.dialog}px`,
        background: sky.background,
        color: sky.textColor,
        minHeight: { xs: 300, sm: 340, md: 380 },
        px: { xs: 3, sm: 4, md: 5 },
        pt: { xs: 3, sm: 4 },
        pb: { xs: 9, sm: 10, md: 12 },
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create('color', { duration: theme.transitions.duration.standard }),
      }}
    >
      {/* A faint horizon line where the sky meets the ground band. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: { xs: 40, md: 48 },
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${sky.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(10,12,20,0.18)'}, transparent)`,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            aria-hidden
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: sky.horizon,
              boxShadow: `0 0 0 1.5px ${sky.textColor}`,
            }}
          />
          <Typography id="sky-phase" component="h2" variant="overline" sx={{ fontSize: '0.8125rem' }}>
            {PHASE_LABEL[sun.phase]}
            <VisuallyHidden> now in {location.name}</VisuallyHidden>
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {location.name}
          </Typography>
          {remoteZone ? (
            <Typography variant="caption" component="p">
              Local time · {formatTimeZoneOffset(now, location.timeZone)}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ mt: 'auto', pt: { xs: 5, sm: 6 } }}>
        <Typography variant="time" component="p">
          <time dateTime={now.toISOString()}>
            {time}
            {period ? (
              <Box
                component="span"
                sx={{ fontFamily: 'fontFamily', fontSize: '0.3em', fontWeight: 600, ml: '0.3em', letterSpacing: '0.02em' }}
              >
                {period}
              </Box>
            ) : null}
          </time>
        </Typography>
        <Typography variant="subtitle1" component="p" sx={{ mt: { xs: 1.5, sm: 2 }, fontSize: { xs: '1.0625rem', sm: '1.1875rem' }, fontWeight: 500 }}>
          <span aria-hidden>{next.text}</span>
          <VisuallyHidden>{next.spoken}</VisuallyHidden>
        </Typography>
        <Typography variant="body2" component="p" sx={{ mt: 0.5, fontWeight: 500 }}>
          Sun {describeElevation(elevation)}
          {elevation > -18 ? ` · ${compassPoint(azimuth)}` : ''}
        </Typography>
      </Box>
    </Box>
  );
}
