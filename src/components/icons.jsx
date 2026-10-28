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
