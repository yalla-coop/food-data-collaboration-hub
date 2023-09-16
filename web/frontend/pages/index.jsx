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
    <div>
      <button
        type="button"
        onClick={() => {
          window.open(
            `https://${window.location.host}/oidc/login?host=${window.location.host}`,
            '_blank',
            'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400'
          );
        }}
      >
        Login
      </button>

      <button
        type="button"
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
      </button>

      {loading && <div>Loading...</div>}
    </div>
  );
}
