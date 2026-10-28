import SvgIcon from '@mui/material/SvgIcon';

/** Line icons drawn to match the weight of Material's outlined set. */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function SunriseIcon(props) {
  return (
    <SvgIcon {...props}>
      <path {...stroke} d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 3v6M9.5 5.5 12 3l2.5 2.5M8 21h8" />
    </SvgIcon>
  );
}

export function SunsetIcon(props) {
  return (
    <SvgIcon {...props}>
      <path {...stroke} d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 3v6M9.5 6.5 12 9l2.5-2.5M8 21h8" />
    </SvgIcon>
  );
}

export function GoldenHourIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        {...stroke}
        d="M3 17h18M7 17a5 5 0 0 1 10 0M12 6.5v2M5.6 9.6l1.4 1.4M18.4 9.6 17 11M2.5 13.5h1.8M19.7 13.5h1.8M8 20.5h8"
      />
    </SvgIcon>
  );
}

export function BlueHourIcon(props) {
  return (
    <SvgIcon {...props}>
      <path {...stroke} d="M3 18h18M8 21h8M15.5 4.5a6 6 0 1 0 4.2 9.7 5 5 0 0 1-4.2-9.7Z" />
    </SvgIcon>
  );
}

export function SolarNoonIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle {...stroke} cx="12" cy="12" r="4" />
      <path
        {...stroke}
        d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"
      />
    </SvgIcon>
  );
}

export function DayLengthIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle {...stroke} cx="12" cy="12" r="8.5" />
      <path {...stroke} d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

/** The Solstice mark: a sun half above a horizon line. */
export function SolsticeMark({ size = 28, sunColor, lineColor = 'currentColor', title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d="M7 20.5a9 9 0 0 1 18 0Z" fill={sunColor} />
      <rect x="3" y="22" width="26" height="2.25" rx="1.125" fill={lineColor} />
    </svg>
  );
}
