/* eslint-disable no-nested-ternary */
import { useLayoutEffect, useState } from 'react';
import { Redirect } from '@shopify/app-bridge/actions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useAppBridge } from '@shopify/app-bridge-react';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';

import { useAppQuery } from '../hooks';
import { useAuth } from '../components/providers/AuthProvider';
import { ProductsCard } from '../components/ProductsCard';
import { convertShopifyGraphQLIdToNumber } from '../utils/index.js';

export default function ProductsList() {
  const [productSinceId, setProductSinceId] = useState(0);
  const [
    remainingProductsCountBeforeNextFetch,
    setRemainingProductsCountBeforeNextFetch
  ] = useState(0);
  const [productsList, setProductsList] = useState([]);
  const [helpTextVisible, setHelpTextVisible] = useState(false);

  const app = useAppBridge();

  const { data: currentSalesSessionData } = useAppQuery({
    url: '/api/sales-session',
    fetchInit: {
      method: 'GET'
    }
  });

  const redirect = Redirect.create(app);

  const { data: userAuthData } = useAuth();
  console.log('userAuthData :>> ', userAuthData);
  const [exitingProductsList, setExitingProductsList] = useState([]);

  const { isLoading: exitingProductsIsLoading } = useAppQuery({
    url: '/api/products',
    reactQueryOptions: {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          setExitingProductsList(data);
        }
      }
    }
  });

  const {
    data: producerProductsData,
    isLoading,
    error: getProductDataError
  } = useAppQuery({
    reactQueryOptions: {},
    url: `/api/products/fdc?sinceId=${productSinceId}&remainingProductsCountBeforeNextFetch=${
      remainingProductsCountBeforeNextFetch || 0
    }`
  });

  console.log('existing products :>> ', exitingProductsList);
  console.log('producerProductsData :>> ', producerProductsData);
  useLayoutEffect(() => {
    if (producerProductsData?.products) {
      setProductsList((prev) => [...prev, ...producerProductsData?.products]);
    }
  }, [producerProductsData]);

  const isCurrentSalesSessionCreated =
    currentSalesSessionData?.currentSalesSession;

  const isCurrentSalesSessionActive =
    currentSalesSessionData?.currentSalesSession?.isActive;

  if (!userAuthData?.isAuthenticated) {
    redirect.dispatch(Redirect.Action.APP, '/');
    return null;
  }

  if ((productsList.length === 0 && isLoading) || exitingProductsIsLoading) {
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
  }

  if (getProductDataError) {
    return (
      <Alert
        severity="warning"
        sx={{
          typography: 'body1',
          fontSize: '20px'
        }}
      >
        We're having some issues with connecting your Open ID Account to the
        Producer App - the error is :
        {getProductDataError?.message ||
          getProductDataError?.error ||
          'Unknown error'}
      </Alert>
    );
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
  console.log('productsList :>> ', productsList);
  return (
    <Box>
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
          When listing Products in your shopfront, you may wish to map them to a
          wholesale variant.
        </Typography>
        <Typography variant="body1">
          <Typography variantMapping="span" fontWeight="600">
            For example:{' '}
          </Typography>
          this would allow you to order a box/case of 6 bottles of vinegar from
          your supplier, whilst listing a single bottle in your shop
        </Typography>
        <Typography variant="body1">
          You could also order a 25kg sack of Oats, and sell single 1kg bags to
          your customers.
        </Typography>
        <Typography variant="body1">
          The FDC Ordering process can handle this logic for you (automatically
          tracking multiple customer orders within a Sales Session and
          increasing your wholesale order as required).
        </Typography>
        <Typography variant="body1">
          In order for this to work you need to provide 4 pieces of information:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Typography variantMapping="span" fontWeight="600">
                1.
              </Typography>
            </ListItemIcon>
            <ListItemText primary="The variant you wish to list in your shopfront (for customers to order)" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Typography variantMapping="span" fontWeight="600">
                2.
              </Typography>
            </ListItemIcon>
            <ListItemText primary="The variant you wish to order from your supplier (the mapped variant)" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Typography variantMapping="span" fontWeight="600">
                3.
              </Typography>
            </ListItemIcon>
            <ListItemText primary="A number that indicates the multiplier to apply before ordering another of the mapped variant (for example if a box/case has 6 bottles and you're selling individual bottles, the number would be 6)" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Typography variantMapping="span" fontWeight="600">
                4.
              </Typography>
            </ListItemIcon>
            <ListItemText primary="Whether to order another of the mapped variant when the first product is sold out of that case, or to wait until a full case is ordered (this functionality allows you to carry stock, off the system, and simply use it to restock any cases sold)." />
          </ListItem>
        </List>

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

      <Stack spacing="12px" px="60px" py="12px">
        {productsList.map((product) => (
          <ProductsCard
            key={product.id}
            product={product}
            exitingProduct={
              exitingProductsList?.find(
                (exitingProduct) =>
                  Number(exitingProduct.producerProductId) ===
                  convertShopifyGraphQLIdToNumber(product.id)
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
            isLoading ||
            producerProductsData?.remainingProductsCountAfter === 0 ||
            !producerProductsData?.lastId
          }
        >
          {isLoading
            ? 'Loading...'
            : !producerProductsData?.lastId
            ? 'No more products'
            : 'Load more products'}
        </Button>
      </Stack>
    </Box>
  );
}
