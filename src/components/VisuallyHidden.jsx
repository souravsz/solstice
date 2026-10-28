import Box from '@mui/material/Box';

/** Content for screen readers only. */
export function VisuallyHidden({ component = 'span', children, ...props }) {
  return (
    <Box
      component={component}
      sx={{
        // Strings on purpose: in MUI's sx, `width: 1` would mean 100%.
        position: 'absolute',
        width: '1px',
        height: '1px',
        p: 0,
        m: '-1px',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
