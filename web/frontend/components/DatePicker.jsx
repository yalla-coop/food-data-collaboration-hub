/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';

export function DatePickerComponent(datePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: '100%'
        }}
      >
        <DatePicker {...datePickerProps} />
      </Box>
    </LocalizationProvider>
  );
}
