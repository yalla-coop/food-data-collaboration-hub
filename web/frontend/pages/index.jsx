import Stack from "@mui/material/Stack";
import { CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppQuery } from "../hooks/index.js";

export default function Home() {
  const app = useAppBridge();
  const [loading, setLoading] = useState(false);
  const redirect = Redirect.create(app);

  const { data } = useAppQuery({
    url: "/api/user/check",
    reactQueryOptions: {
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        if (data && data?.isAuthenticated) {
          return redirect.dispatch(Redirect.Action.APP, "/productslist");
        }
      },
    },
  });

  return (
    <Stack
      spacing="20px"
      sx={{
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {loading ? (
        <CircularProgress size={30} />
      ) : (
        <>
          <Typography variant="h4">
            Welcome to the Food Data Collaboration Shopify App.
          </Typography>
          <Typography variant="h6">
            Please login into your OpenID Connect Account to access the Commons.
          </Typography>
          <iframe
            src={`https://${window.location.host}/oidc/login?host=${window.location.host}`}
            width="400"
            height="440"
            frameBorder="0"
            title="Login Frame"
          ></iframe>
        </>
      )}
    </Stack>
  );
}
