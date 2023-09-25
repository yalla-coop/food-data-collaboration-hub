import React from 'react';
import { SvgIcon } from '@mui/material';

export function ExpandMoreIcon({ sx, ...props }) {
  return (
    <SvgIcon
      sx={{
        width: '48px',
        height: '48px',
        ...sx
      }}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M33.17 17.17l-9.17 9.17-9.17-9.17-2.83 2.83 12 12 12-12z" />
      <path d="M0 0h48v48h-48z" fill="none" />
    </SvgIcon>
  );
}
