import { BrowserRouter } from 'react-router-dom';
import { NavigationMenu } from '@shopify/app-bridge-react';
import Routes from './Routes';

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
  AuthProvider
} from './components';

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info

  const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <AuthProvider>
              <NavigationMenu
                navigationLinks={[
                  {
                    label: 'Product List',
                    destination: '/productslist'
                  },
                  {
                    label: 'Login',
                    destination: '/'
                  }
                ]}
              />
              <Routes pages={pages} />
            </AuthProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
