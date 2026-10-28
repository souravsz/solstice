import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SoftChip } from './SoftChip.jsx';
import { VisuallyHidden } from '../VisuallyHidden.jsx';

const STATUS_TEXT = { next: 'Next', now: 'Now' };

/**
 * One stat: tinted icon and label on one line, the value below, helper text under it.
 * @param {{ icon: import('react').ElementType, label: string, tone: 'golden' | 'blue', status?: 'next' | 'now' | null, helper?: string | null, children: import('react').ReactNode }} props
 */
export function StatItem({ icon: Icon, label, tone, status = null, helper = null, children }) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minHeight: 22 }}>
        <Icon aria-hidden sx={{ fontSize: 18, color: `sun.${tone}` }} />
        <Typography variant="statLabel" component="h4" sx={{ color: 'text.secondary' }}>
          {label}
          {status ? <VisuallyHidden>, {STATUS_TEXT[status].toLowerCase()}</VisuallyHidden> : null}
        </Typography>
        {status ? <SoftChip tone={tone} label={STATUS_TEXT[status]} aria-hidden /> : null}
      </Stack>
      {children}
      {helper ? (
        <Typography variant="statHelper" sx={{ color: 'text.secondary' }}>
          {helper}
        </Typography>
      ) : null}
    </Stack>
  );
}
