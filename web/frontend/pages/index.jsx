import Stack from "@mui/material/Stack";
import { CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useAuth } from "../components/providers/AuthProvider";

export default function Home() {
  const authenticatedFetch = useAuthenticatedFetch();
  const app = useAppBridge();
  const [loading, setLoading] = useState(false);
  const redirect = Redirect.create(app);
  const { data: userAuthData } = useAuth();

  if (userAuthData?.isAuthenticated) {
    redirect.dispatch(Redirect.Action.APP, "/productslist");
    return null;
  }

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
