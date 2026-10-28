import { useId, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { keyframes, useTheme } from '@mui/material/styles';
import { useElementWidth } from '../hooks/useElementWidth.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { alpha } from '../lib/color/color.js';
import { ELEVATION, getSunElevation } from '../lib/solar/index.js';
import { buildArcGeometry } from '../lib/sky/arcGeometry.js';
import { describeElevation } from '../lib/summary/describe.js';
import { formatTime } from '../lib/time/format.js';
import { fonts } from '../theme/tokens.js';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.32; }
  50% { transform: scale(1.35); opacity: 0.14; }
`;

const hourLabel = (date, timeZone) =>
  new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone }).format(date);

/** A text version of the chart for screen readers. */
function describeArc(day, nowElevation) {
  const { times, timeZone } = day;
  const t = (d) => formatTime(d, timeZone);
  const peak = `${Math.round(times.noonElevation)}°`;
  let text;
  if (times.alwaysUp) {
    text = `The sun stays above the horizon all day, highest at ${peak} at ${t(times.solarNoon)}.`;
  } else if (times.alwaysDown) {
    text = `The sun stays below the horizon all day, coming closest at ${peak} at ${t(times.solarNoon)}.`;
  } else {
    text = `The sun rises at ${t(times.sunrise)}, climbs to ${peak} at ${t(times.solarNoon)} and sets at ${t(times.sunset)}.`;
  }
  if (nowElevation !== null) text += ` Right now it is ${describeElevation(nowElevation)}.`;
  return text;
}

function LegendDot({ color, label }) {
  return (
    <Box component="li" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box aria-hidden sx={{ width: 10, height: 3, borderRadius: 2, backgroundColor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

/**
 * The sun's path across the selected day as an SVG arc, coloured by phase,
 * with the horizon, sunrise and sunset, and the sun's position now (today only).
 */
export function SunArc({ day, location, now, isToday }) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [measureRef, width] = useElementWidth();
  const height = Math.round(Math.min(300, Math.max(210, width * 0.34)));

  const geometry = useMemo(
    () => (width > 0 ? buildArcGeometry(day.samples, day.bounds, { width, height }) : null),
    [day, width, height],
  );

  const { phase, phaseFill, surface } = theme.palette;
  const showNow = isToday && now >= day.bounds.start && now < day.bounds.end;
  const nowElevation = showNow ? getSunElevation(now, location.lat, location.lng) : null;
  const description = describeArc(day, nowElevation);
  const { times, timeZone } = day;

  const ids = {
    title: `${uid}-title`,
    desc: `${uid}-desc`,
    clipPlot: `${uid}-plot`,
    clipAbove: `${uid}-above`,
    fill: `${uid}-fill`,
    glow: `${uid}-glow`,
    band: (name) => `${uid}-band-${name}`,
  };

  const labelStyle = {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: 500,
    fill: theme.palette.text.secondary,
    fontVariantNumeric: 'tabular-nums',
  };

  const sunColor = nowElevation !== null && nowElevation > ELEVATION.SUNRISE ? phase.goldenHour : phase.blueHour;
  const labelsCollide =
    geometry && times.sunrise && times.sunset
      ? geometry.x(times.sunset.getTime()) - geometry.x(times.sunrise.getTime()) < 260
      : false;

  return (
    <Card component="section" aria-labelledby={`${uid}-heading`}>
      <CardContent>
        <Box
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1 }}
        >
          <Typography id={`${uid}-heading`} variant="cardTitle">
            Sun path
          </Typography>
          <Box component="ul" aria-label="Legend" sx={{ display: 'flex', gap: 2, listStyle: 'none', m: 0, p: 0 }}>
            <LegendDot color={phase.goldenHour} label="Golden hour" />
            <LegendDot color={phase.blueHour} label="Blue hour" />
          </Box>
        </Box>

        <Box ref={measureRef} sx={{ width: '100%', height, position: 'relative' }}>
          {geometry ? (
            <svg
              width={geometry.width}
              height={geometry.height}
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
              role="img"
              aria-labelledby={`${ids.title} ${ids.desc}`}
              style={{ display: 'block', overflow: 'visible' }}
            >
              <title id={ids.title}>Sun path for the selected day in {location.name}</title>
              <desc id={ids.desc}>{description}</desc>
              <defs>
                <clipPath id={ids.clipPlot}>
                  <rect x={0} y={0} width={geometry.width} height={geometry.plot.y + geometry.plot.height} />
                </clipPath>
                <clipPath id={ids.clipAbove}>
                  <rect x={0} y={0} width={geometry.width} height={geometry.horizonY} />
                </clipPath>
                {Object.entries(geometry.bands).map(([name, band]) => (
                  <clipPath key={name} id={ids.band(name)}>
                    <rect x={0} y={band.y0} width={geometry.width} height={Math.max(0, band.y1 - band.y0)} />
                  </clipPath>
                ))}
                <linearGradient id={ids.fill} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={phase.day} stopOpacity={theme.palette.mode === 'light' ? 0.16 : 0.22} />
                  <stop offset="100%" stopColor={phase.goldenHour} stopOpacity={0.05} />
                </linearGradient>
                <radialGradient id={ids.glow}>
                  <stop offset="0%" stopColor={sunColor} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={sunColor} stopOpacity={0} />
                </radialGradient>
              </defs>

              {/* Hour gridlines and labels */}
              {day.ticks.map((tick, i) => {
                const x = geometry.x(tick.getTime());
                const anchor = i === 0 ? 'start' : i === day.ticks.length - 1 ? 'end' : 'middle';
                return (
                  <g key={tick.getTime()}>
                    {i > 0 && i < day.ticks.length - 1 ? (
                      <line
                        x1={x}
                        x2={x}
                        y1={geometry.plot.y - 8}
                        y2={geometry.plot.y + geometry.plot.height}
                        stroke={theme.palette.divider}
                        strokeDasharray="2 4"
                      />
                    ) : null}
                    <text x={x} y={geometry.height - 6} textAnchor={anchor} style={labelStyle}>
                      {hourLabel(tick, timeZone)}
                    </text>
                  </g>
                );
              })}

              {/* Ground below the horizon */}
              <rect
                x={geometry.plot.x}
                y={geometry.horizonY}
                width={geometry.plot.width}
                height={Math.max(0, geometry.plot.y + geometry.plot.height - geometry.horizonY)}
                rx={6}
                fill={alpha(surface.textPrimary, theme.palette.mode === 'light' ? 0.035 : 0.05)}
              />

              {/* Daylight under the arc */}
              <path
                d={`${geometry.path}L${geometry.plot.x + geometry.plot.width},${geometry.horizonY}L${geometry.plot.x},${geometry.horizonY}Z`}
                fill={`url(#${ids.fill})`}
                clipPath={`url(#${ids.clipAbove})`}
              />

              {/* The arc, one stroke per phase band */}
              <g clipPath={`url(#${ids.clipPlot})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d={geometry.path} stroke={phaseFill.night} strokeWidth={2} strokeDasharray="1 5" clipPath={`url(#${ids.band('night')})`} opacity={0.9} />
                <path d={geometry.path} stroke={phase.blueHour} strokeWidth={3} clipPath={`url(#${ids.band('blue')})`} />
                <path d={geometry.path} stroke={phase.goldenHour} strokeWidth={3} clipPath={`url(#${ids.band('golden')})`} />
                <path d={geometry.path} stroke={phase.day} strokeWidth={2.25} clipPath={`url(#${ids.band('day')})`} />
              </g>

              {/* Horizon */}
              <line
                x1={geometry.plot.x}
                x2={geometry.plot.x + geometry.plot.width}
                y1={geometry.horizonY}
                y2={geometry.horizonY}
                stroke={surface.borderStrong}
                strokeWidth={1}
              />

              {/* Highest point */}
              <g>
                <circle cx={geometry.peak.x} cy={geometry.peak.y} r={2.5} fill={theme.palette.text.secondary} />
                <text x={geometry.peak.x} y={geometry.peak.y - 10} textAnchor="middle" style={labelStyle}>
                  {`${Math.round(geometry.peak.elevation)}°`}
                </text>
              </g>

              {/* Sunrise and sunset, labelled on the inner side of each crossing */}
              {[
                { at: times.sunrise, label: 'Sunrise', side: 1, row: 0 },
                // On short days the two labels would collide, so the sunset label drops a line.
                { at: times.sunset, label: 'Sunset', side: -1, row: labelsCollide ? 1 : 0 },
              ].map(({ at, label, side, row }) =>
                at ? (
                  <g key={label}>
                    <circle cx={geometry.x(at.getTime())} cy={geometry.horizonY} r={3.5} fill={phase.goldenHour} stroke={surface.surface} strokeWidth={1.5} />
                    <text
                      x={geometry.x(at.getTime()) + side * 8}
                      y={geometry.horizonY + 18 + row * 16}
                      textAnchor={side > 0 ? 'start' : 'end'}
                      style={{ ...labelStyle, fill: theme.palette.text.primary }}
                    >
                      {label} {formatTime(at, timeZone)}
                    </text>
                  </g>
                ) : null,
              )}

              {/* The sun now */}
              {nowElevation !== null ? (
                <g transform={`translate(${geometry.x(now.getTime())} ${geometry.y(nowElevation)})`}>
                  <Box
                    component="circle"
                    r={16}
                    fill={`url(#${ids.glow})`}
                    sx={{
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      opacity: 0.32,
                      animation: reduceMotion ? 'none' : `${pulse} 3.2s ease-in-out infinite`,
                    }}
                  />
                  <circle r={6} fill={sunColor} stroke={surface.surface} strokeWidth={2} />
                </g>
              ) : null}
            </svg>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}
