import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Redirect } from "@shopify/app-bridge/actions";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useAppMutation, useAppQuery } from "../hooks";
import { useAuth } from "../components/providers/AuthProvider";
import { DatePickerComponent } from "../components/DatePicker";

export default function SalesSession() {
  const app = useAppBridge();
  const queryClient = useQueryClient();

  const [showSuccessAlert, setShowSuccessAlert] = useState({
    show: false,
    type: "",
  });

  useEffect(() => {
    if (showSuccessAlert.show) {
      setTimeout(() => {
        setShowSuccessAlert({
          show: false,
          type: "",
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
    isLoading: currentSalesSessionIsLoading,
    error: loadSalesSessionsError,
  } = useAppQuery({
    url: "/api/sales-session",
    fetchInit: {
      method: "GET",
    },
    reactQueryOptions: {
      onSuccess: (data) => {
        if (!data?.currentSalesSession?.isActive) {
          return;
        }

        const currentSalesStartDate = dayjs(
          data?.currentSalesSession?.startDate
        );
        const currentSalesSessionSessionDurationInDays =
          data?.currentSalesSession?.sessionDuration;

        setStartDate(currentSalesStartDate);
        setSessionDurationInDays(currentSalesSessionSessionDurationInDays);
      },
    },
  });

  const {
    mutateAsync: createSalesSession,
    isLoading: createSalesSessionIsLoading,
    error: createSalesSessionError,
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries("/api/sales-session");
        setShowSuccessAlert({
          show: true,
          type: "created",
        });
      },
    },
  });

  const {
    mutateAsync: editCurrentSalesSession,
    isLoading: editCurrentSalesSessionIsLoading,
    error: editCurrentSalesSessionError,
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries("/api/sales-session");
        setShowSuccessAlert({
          show: true,
          type: "updated",
        });
      },
    },
  });

  const {
    mutateAsync: completeCurrentSalesSession,
    isLoading: completeCurrentSalesSessionIsLoading,
    error: completeCurrentSalesSessionError,
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries("/api/sales-session");
        setShowSuccessAlert({
          show: true,
          type: "Finished/Completed",
        });
      },
    },
  });

  const {
    mutateAsync: logout,
    isLoading: logoutIsLoading,
    error: logoutError,
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        console.log("Loging out ...");
      },
    },
  });

  const handleOnEditCurrentSalesSessionClick = async () => {
    await editCurrentSalesSession({
      url: "/api/sales-session/current",
      fetchInit: {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          sessionDurationInDays: Number(sessionDurationInDays),
        }),
      },
    });
  };

  const handleOnFinishCurrentSalesSessionClick = async () => {
    await completeCurrentSalesSession({
      url: "/api/sales-session/current/complete",
      fetchInit: {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      },
    });
  };

  const handleOnCreateSalesSessionClick = async () => {
    await createSalesSession({
      url: "/api/sales-session",
      fetchInit: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          sessionDurationInDays: Number(sessionDurationInDays),
        }),
      },
    });
  };

  if (!userAuthData?.isAuthenticated || loadSalesSessionsError) {
    redirect.dispatch(Redirect.Action.APP, "/");
    return null;
  }

  if (currentSalesSessionIsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Button
        type="button"
        color="success"
        sx={{
          p: "6px",
          position: "fixed",
          right: "80px",
          bottom: "16px",
          borderRadius: "16px",
          zIndex: 1000,
          textTransform: "none",
        }}
        variant="contained"
        onClick={async () => {
          logout({
            url: "/api/user/logout",
            fetchInit: {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            },
          });

          redirect.dispatch(Redirect.Action.APP, "/");
        }}
      >
        Logout
        {logoutIsLoading && (
          <CircularProgress
            color="white"
            size={20}
            sx={{ marginLeft: "10px" }}
          />
        )}
      </Button>
      <Stack
        spacing={2}
        sx={{
          margin: "0 auto",
          p: 2,
        }}
      >
        <Typography variant="h5">Sales Session Management Console</Typography>
        <Typography variant="h8">
          Sales Sessions (in other platforms sometimes called Order Cycles)
          allow you to manage your supplier orders around when you pack/deliver
          your orders.
        </Typography>
        <Typography variant="h8">
          A Sales Session will end at midnight on the final day, any Supplier
          Orders will be Completed (and passed for fulfilment), and a new Sales
          Session (of the same duration) will be created to start on the
          following day.
        </Typography>
        <Typography variant="h8">
          You MUST create a Sales Session to utilise the FDC Commons. You should
          set the duration to the frequency that you process your Customer
          Orders (i.e. for weekly, set the duration to 7 days, for fortnightly
          14 days etc). If you want to place orders on a daily basis, set the
          duration to 1 day.
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
          width: "300px",
          margin: "0 auto",
          p: 2,
        }}
      >
        <DatePickerComponent
          sx={{
            width: "100%",
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
            width: "100%",
          }}
          label="End Date"
          value={dayjs(startDate).add(sessionDurationInDays, "day")}
          onChange={(newValue) => {
            setSessionDurationInDays(
              dayjs(newValue).diff(startDate, "day", false)
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
          {createSalesSessionIsLoading ? "Loading..." : "Create Sales Session"}
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
            ? "Loading..."
            : "Edit Current Sales Session"}
        </Button>

        <Button
          variant="contained"
          type="button"
          onClick={handleOnFinishCurrentSalesSessionClick}
          disabled={
            completeCurrentSalesSessionIsLoading ||
            !currentSalesSessionData?.currentSalesSession?.isActive
          }
        >
          {completeCurrentSalesSessionIsLoading
            ? "Loading..."
            : "Finish/Complete Current Sales Session"}
        </Button>

        {createSalesSessionError && (
          <Alert severity="error">{createSalesSessionError.message}</Alert>
        )}

        {editCurrentSalesSessionError && (
          <Alert severity="error">{editCurrentSalesSessionError.message}</Alert>
        )}

        {completeCurrentSalesSessionError && (
          <Alert severity="error">
            {completeCurrentSalesSessionError.message}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
