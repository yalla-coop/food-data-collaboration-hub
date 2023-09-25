import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useQueryClient } from 'react-query';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useAuth } from '../components/providers/AuthProvider';

export default function Home() {
  const authenticatedFetch = useAuthenticatedFetch();
  const app = useAppBridge();
  const [loading, setLoading] = useState(false);
  const redirect = Redirect.create(app);
  const qc = useQueryClient();

  const { data: userAuthData } = useAuth();

  if (userAuthData?.isAuthenticated) {
    redirect.dispatch(Redirect.Action.APP, '/productslist');
    return null;
  }

  return (
    <Stack
      spacing="20px"
      sx={{
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {loading ? (
        <CircularProgress size={30} />
      ) : (
        <>
          <Typography variant="h2">Welcome to the Shopify App</Typography>
          <Typography variant="h3">Please login to continue</Typography>

          <Button
            variant="contained"
            type="button"
            sx={{
              width: '200px',
              height: '10px',
              p: '30px',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
            onClick={() => {
              window.open(
                `https://${window.location.host}/oidc/login?host=${window.location.host}`,
                '_blank',
                'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400'
              );
            }}
          >
            Login
          </Button>

          <Button
            variant="contained"
            type="button"
            sx={{
              width: '200px',
              height: '10px',
              p: '30px',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
            onClick={async () => {
              setLoading(true);
              await authenticatedFetch('/api/user/logout', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              await qc.invalidateQueries('/api/user/check');
              redirect.dispatch(Redirect.Action.APP, '/');
              setLoading(false);
            }}
          >
            Logout
          </Button>
        </>
      )}
    </Stack>
  );
}
