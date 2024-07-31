/* eslint-disable no-nested-ternary */
import { useLayoutEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Redirect } from '@shopify/app-bridge/actions';
import Button from '@mui/material/Button';
import { useAppBridge } from '@shopify/app-bridge-react';

import { Alert, Box, CircularProgress } from '@mui/material';

import { useAppMutation, useAppQuery } from '../hooks';
import { useAuth } from '../components/providers/AuthProvider';
import { ProductsCard } from '../components/ProductsCard';
import { convertShopifyGraphQLIdToNumber } from '../utils/index.js';
import { Link } from 'react-router-dom';

export default function ProductsList() {
  const [productSinceId, setProductSinceId] = useState(0);
  const [
    remainingProductsCountBeforeNextFetch,
    setRemainingProductsCountBeforeNextFetch
  ] = useState(0);
  const [producerProducts, setProducerProducts] = useState([]);
  const [hubProducts, setHubProducts] = useState([]);
  const [helpTextVisible, setHelpTextVisible] = useState(false);
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { data: userAuthData } = useAuth();

  const { data: currentSalesSessionData } = useAppQuery({
    url: '/api/sales-session',
    fetchInit: {
      method: 'GET'
    }
  });

  const { isFetching: exitingProductsIsLoading } = useAppQuery({
    url: '/api/products',
    reactQueryOptions: {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          setHubProducts(data);
        }
      }
    }
  });

  const {
    data: producerProductsData,
    isFetching: isLoading,
    error: getProductDataError
  } = useAppQuery({
    reactQueryOptions: {},
    url: `/api/products/fdc?sinceId=${productSinceId}&remainingProductsCountBeforeNextFetch=${
      remainingProductsCountBeforeNextFetch || 0
    }`
  });

  const {
    mutateAsync: logout,
    isLoading: logoutIsLoading,
    error: logoutError
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        console.log('Loging out ...');
      }
    }
  });

  const isAccessPermissionDeniedError =
    getProductDataError?.message?.includes('access denied') ||
    getProductDataError?.stack?.includes('403');

  const isServerError =
    getProductDataError?.message?.includes('500') ||
    getProductDataError?.stack?.includes('500');

  const isUnauthorizedError =
    getProductDataError?.message?.includes('401') ||
    getProductDataError?.stack?.includes('401');

  const handleGetProductDataError = () => {
    if (isAccessPermissionDeniedError) {
      return (
        <Alert severity="error">
          You must be authorised by the Producer to view their products, please
          check back again shortly or contact your producer to confirm your
          access.
          {getProductDataError?.message && (
            <div>Message: {getProductDataError?.message}</div>
          )}
        </Alert>
      );
    } else if (isUnauthorizedError) {
      return (
        <Alert severity="error">
          You need to login to be able to see the Product List.{' '}
          <Link to="/" replace>
            Click here
          </Link>{' '}
          to login to your account
          <div>Message: {getProductDataError?.message}</div>
        </Alert>
      );
    } else if (isServerError) {
      return (
        <Alert severity="error">
          There was an error fetching the products. Please try again later.
          <div>Message: {getProductDataError?.message}</div>
        </Alert>
      );
    } else {
      return (
        <Alert severity="error">
          An unexpected error occurred. Please try again later.
          <div>Message: {getProductDataError?.message}</div>
        </Alert>
      );
    }
  };

  useLayoutEffect(() => {
    if (producerProductsData) {
      setProducerProducts((prev) => [...prev, ...producerProductsData]);
    }
  }, [producerProductsData]);

  if (
    (producerProducts.length === 0 && isLoading) ||
    exitingProductsIsLoading
  ) {
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
  } else if (getProductDataError) {
    return handleGetProductDataError();
  }

  const handleShowMore = () => {
    if (!producerProductsData?.lastId) {
      return;
    }
    setProductSinceId(producerProductsData?.lastId);
    setRemainingProductsCountBeforeNextFetch(
      producerProductsData?.remainingProductsCountAfter
    );
  };

  const isCurrentSalesSessionCreated =
    currentSalesSessionData?.currentSalesSession;

  const isCurrentSalesSessionActive =
    currentSalesSessionData?.currentSalesSession?.isActive;

  return (
    <Box>
      <Button
        type="button"
        color="success"
        sx={{
          p: '6px',
          position: 'fixed',
          right: '80px',
          bottom: '16px',
          borderRadius: '16px',
          zIndex: 1000,
          textTransform: 'none'
        }}
        variant="contained"
        onClick={async () => {
          logout({
            url: '/api/user/logout',
            fetchInit: {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          });

          redirect.dispatch(Redirect.Action.APP, '/');
        }}
      >
        Logout
        {logoutIsLoading && (
          <CircularProgress
            color="white"
            size={20}
            sx={{ marginLeft: '10px' }}
          />
        )}
      </Button>
      <Button
        type="button"
        color="success"
        sx={{
          p: '6px',
          position: 'fixed',
          right: '12px',
          bottom: '16px',
          borderRadius: '16px',
          zIndex: 1000,
          textTransform: 'none'
        }}
        variant="contained"
        onClick={() => setHelpTextVisible((prev) => !prev)}
      >
        Info
      </Button>

      <Typography variant="h2" textAlign="center">
        Products
      </Typography>

      <Stack
        spacing="6px"
        p="12px"
        sx={{
          p: '16px',
          position: 'fixed',
          borderRadius: '12px',
          boxShadow: '0px 0px 12px 0px rgba(0,0,0,0.75)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '800px',
          backgroundColor: 'white',
          zIndex: 100,
          visibility: helpTextVisible ? 'visible' : 'hidden'
        }}
      >
        <Typography variant="h3" textAlign="center">
          Help
        </Typography>

        <Typography variant="body1">
          Here you will see listings for Products your Producer(s) are willing
          for you to sell in your shopfront.
        </Typography>
        <Typography variant="body1">
          You can adjust the sale price products will be listed in your store,
          either by an absolute amount (e.g. +£1.50) or a percentage markup
          (e.g. 50%). To use the percentage markup functionality, select
          "increase price by %" from the Markup dropdown menu.
        </Typography>
        <Typography variant="body1">
          The markup value/percentage on the listed products will remain
          constant and any pricing changes from your Producers will be
          incorporated when a new Sales Session is generated.
        </Typography>
        <Typography variantMapping="span" fontWeight="600">
          For example:
        </Typography>
        <Typography variant="body1">
          If you list a 500g bag of beans, with a markup of £0.99. and a
          wholesale price of £1.23, that would give a retail price of £2.22.
        </Typography>
        <Typography variant="body1">
          If the producer then increases the wholesale price to £1.50, at the
          beginning of the next Sales Session, the retail price in your store
          would be increased to £2.49.
        </Typography>

        <Button
          sx={{
            p: '12px',
            margin: '0 auto',
            width: '200px'
          }}
          variant="contained"
          onClick={() => setHelpTextVisible((prev) => !prev)}
        >
          Close
        </Button>
      </Stack>

      {!isCurrentSalesSessionCreated && (
        <Alert
          severity="warning"
          sx={{
            typography: 'body1',
            fontSize: '20px'
          }}
        >
          There is no active sales session , please create one to be able to add
          products to your store
        </Alert>
      )}

      {isCurrentSalesSessionCreated && !isCurrentSalesSessionActive && (
        <Alert
          severity="warning"
          sx={{
            typography: 'body1',
            fontSize: '20px'
          }}
        >
          There is no active sales session , please create one
        </Alert>
      )}

      {!producerProducts.length && (
        <Alert
          severity="warning"
          sx={{
            typography: 'body1',
            fontSize: '20px'
          }}
        >
          No products available
        </Alert>
      )}

      <Stack spacing="12px" px="60px" py="12px">
        {producerProducts.map((product) => (
          <ProductsCard
            key={'product-' + product.retailProduct.id}
            producerProduct={product}
            existingProduct={
              hubProducts?.find(
                (exitingProduct) =>
                  Number(exitingProduct.producerProductId) ===
                  convertShopifyGraphQLIdToNumber(product.retailProduct.id)
              ) || {}
            }
          />
        ))}
        <Button
          sx={{
            p: '12px',
            margin: '0 auto',
            width: '200px',
            display: 'block'
          }}
          variant="contained"
          type="button"
          onClick={handleShowMore}
          disabled={
            isLoading || producerProductsData?.remainingProductsCountAfter === 0
          }
        >
          {isLoading
            ? 'Loading...'
            : !producerProductsData.remainingProductsCountAfter
            ? 'No more products'
            : 'Load more products'}
        </Button>
      </Stack>
    </Box>
  );
}
