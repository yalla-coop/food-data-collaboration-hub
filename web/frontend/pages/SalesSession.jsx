import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  Button,
  Stack,
  TextField,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { useQueryClient } from 'react-query';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useAppMutation, useAppQuery } from '../hooks';
import { useAuth } from '../components/providers/AuthProvider';
import { DatePickerComponent } from '../components/DatePicker';

export default function SalesSession() {
  const app = useAppBridge();
  const queryClient = useQueryClient();

  const [showSuccessAlert, setShowSuccessAlert] = useState({
    show: false,
    type: ''
  });

  useEffect(() => {
    if (showSuccessAlert.show) {
      setTimeout(() => {
        setShowSuccessAlert({
          show: false,
          type: ''
        });
      }, 3000);
    }
  }, [showSuccessAlert]);

  // get the current sales session from the server
  // if there is no current sales session, then create one
  // if there is a current sales session, then show the current sales session

  const [startDate, setStartDate] = useState(dayjs(new Date()));
  const [sessionDurationInDays, setSessionDurationInDays] = useState(7);

  const redirect = Redirect.create(app);

  const { data: userAuthData } = useAuth();

  const {
    data: currentSalesSessionData,
    isLoading: currentSalesSessionIsLoading
  } = useAppQuery({
    url: '/api/sales-session',
    fetchInit: {
      method: 'GET'
    },
    reactQueryOptions: {
      onSuccess: (data) => {
        const currentSalesStartDate = dayjs(data.currentSalesSession.startDate);
        const currentSalesSessionSessionDurationInDays =
          data.currentSalesSession.sessionDuration;

        setStartDate(currentSalesStartDate);
        setSessionDurationInDays(currentSalesSessionSessionDurationInDays);
      }
    }
  });

  const {
    mutateAsync: createSalesSession,
    isLoading: createSalesSessionIsLoading,
    error: createSalesSessionError
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries('/api/sales-session');
        setShowSuccessAlert({
          show: true,
          type: 'created'
        });
      }
    }
  });

  const {
    mutateAsync: editCurrentSalesSession,
    isLoading: editCurrentSalesSessionIsLoading,
    error: editCurrentSalesSessionError
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries('/api/sales-session');
        setShowSuccessAlert({
          show: true,
          type: 'updated'
        });
      }
    }
  });

  const {
    mutateAsync: deleteCurrentSalesSession,
    isLoading: deleteCurrentSalesSessionIsLoading,
    error: deleteCurrentSalesSessionError
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries('/api/sales-session');
        setShowSuccessAlert({
          show: true,
          type: 'deleted'
        });
      }
    }
  });

  const handleOnEditCurrentSalesSessionClick = async () => {
    await editCurrentSalesSession({
      url: '/api/sales-session/current',
      fetchInit: {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          sessionDurationInDays: Number(sessionDurationInDays)
        })
      }
    });
  };

  const handleOnDeleteCurrentSalesSessionClick = async () => {
    await deleteCurrentSalesSession({
      url: '/api/sales-session/current',
      fetchInit: {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    });
  };

  const handleOnCreateSalesSessionClick = async () => {
    await createSalesSession({
      url: '/api/sales-session',
      fetchInit: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          sessionDurationInDays: Number(sessionDurationInDays)
        })
      }
    });
  };

  if (!userAuthData?.isAuthenticated) {
    redirect.dispatch(Redirect.Action.APP, '/');
    return null;
  }

  if (currentSalesSessionIsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Stack
        spacing={2}
        sx={{
          margin: '0 auto',
          p: 2
        }}
      >
        <Typography variant="h4">Sales Session</Typography>
        <Typography>
          This is the sales session page. You can create a sales session here.
        </Typography>

        {currentSalesSessionData?.currentSalesSession?.isActive && (
          <Alert severity="warning">There is an active sales session </Alert>
        )}

        {showSuccessAlert.show && (
          <Alert severity="success">
            Sales session {showSuccessAlert.type} successfully
          </Alert>
        )}
      </Stack>

      <Stack
        spacing={2}
        sx={{
          width: '300px',
          margin: '0 auto',
          p: 2
        }}
      >
        <DatePickerComponent
          sx={{
            width: '100%'
          }}
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
        />

        <TextField
          label="Session Duration (in days)"
          fullWidth
          type="number"
          inputProps={{ min: 0 }}
          value={sessionDurationInDays}
          onChange={(event) => setSessionDurationInDays(event.target.value)}
        />

        <DatePickerComponent
          sx={{
            width: '100%'
          }}
          label="End Date"
          value={dayjs(startDate).add(sessionDurationInDays, 'day')}
          onChange={(newValue) => {
            setSessionDurationInDays(
              dayjs(newValue).diff(startDate, 'day', false)
            );
          }}
        />

        <Button
          variant="contained"
          type="button"
          onClick={handleOnCreateSalesSessionClick}
          disabled={
            createSalesSessionIsLoading ||
            currentSalesSessionData?.currentSalesSession?.isActive
          }
        >
          {createSalesSessionIsLoading ? 'Loading...' : 'Create Sales Session'}
        </Button>

        <Button
          variant="contained"
          type="button"
          onClick={handleOnEditCurrentSalesSessionClick}
          disabled={
            editCurrentSalesSessionIsLoading ||
            !currentSalesSessionData?.currentSalesSession?.isActive
          }
        >
          {editCurrentSalesSessionIsLoading
            ? 'Loading...'
            : 'Edit Current Sales Session'}
        </Button>

        <Button
          variant="contained"
          type="button"
          onClick={handleOnDeleteCurrentSalesSessionClick}
          disabled={
            deleteCurrentSalesSessionIsLoading ||
            !currentSalesSessionData?.currentSalesSession?.isActive
          }
        >
          {editCurrentSalesSessionIsLoading
            ? 'Loading...'
            : 'Delete Current Sales Session'}
        </Button>

        {createSalesSessionError && (
          <Alert severity="error">{createSalesSessionError.message}</Alert>
        )}

        {editCurrentSalesSessionError && (
          <Alert severity="error">{editCurrentSalesSessionError.message}</Alert>
        )}

        {deleteCurrentSalesSessionError && (
          <Alert severity="error">
            {deleteCurrentSalesSessionError.message}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
