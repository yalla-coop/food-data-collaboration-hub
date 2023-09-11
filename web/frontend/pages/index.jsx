import { useState } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useQueryClient } from 'react-query';

export default function Home() {
  const authenticatedFetch = useAuthenticatedFetch();
  const app = useAppBridge();
  const [loading, setLoading] = useState(false);
  const redirect = Redirect.create(app);
  const qc = useQueryClient();

  return (
    <div>
      <button
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
        onClick={async () => {
          setLoading(true);
          await authenticatedFetch('/api/user/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          await qc.invalidateQueries('/api/user/check');
          redirect.dispatch(Redirect.Action.APP, `/`);
          setLoading(false);
        }}
      >
        Logout
      </button>

      {loading && <div>Loading...</div>}
    </div>
  );
}
