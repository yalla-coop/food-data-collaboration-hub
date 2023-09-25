import { createContext, useContext } from 'react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';
import { CircularProgress, Stack } from '@mui/material';

import { useAppQuery } from '../../hooks';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const { data, isLoading } = useAppQuery({
    url: '/api/user/check',
    reactQueryOptions: {
      refetchOnWindowFocus: true,
      onError: () => {
        redirect.dispatch(Redirect.Action.APP, '/');
      },
      onSuccess: (data) => {
        if (!data || !data?.isAuthenticated) {
          return redirect.dispatch(Redirect.Action.APP, '/');
        }
      }
    }
  });

  if (isLoading)
    return (
      <Stack
        sx={{
          width: '100vw',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={30} />
      </Stack>
    );

  return (
    <AuthContext.Provider value={{ data, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
