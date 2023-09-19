import { useState } from 'react';
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
  const [nextPageCursorValue, setNextPageCursorValue] = useState(null);
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
    data,
    isLoading,
    error: getProductDataError
  } = useAppQuery({
    reactQueryOptions: {
      onSuccess: (getProductData) => {
        setProductsList([...productsList, ...getProductData.products.list]);
      }
    },
    url: `/api/products/fdc?nextPageCursor=${nextPageCursorValue}`
  });

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
        <CircularProgress size={200} />;
      </Stack>
    );
  }

  const { products: { pageInfo = {} } = {} } = data || {};

  if (getProductDataError) {
    return (
      <div>
        <p>
          Something went wrong, please check the producer server - maybe the
          server is down :{' '}
          {getProductDataError?.message ||
            getProductDataError?.error ||
            'Unknown error'}
        </p>
      </div>
    );
  }

  const handleShowMore = () => {
    if (!pageInfo?.hasNextPage) {
      return;
    }
    setNextPageCursorValue(pageInfo?.startCursor);
  };

  return (
    <Box>
      <Button
        sx={{
          p: '12px',
          position: 'fixed',
          top: '12px',
          right: '12px'
        }}
        variant="contained"
        type="button"
        onClick={handleShowMore}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Show More'}
      </Button>

      <Button
        type="button"
        sx={{
          p: '12px',
          position: 'fixed',
          top: '12px',
          left: '12px'
        }}
        variant="contained"
        onClick={() => setHelpTextVisible((prev) => !prev)}
      >
        Help
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

      <ul>
        {productsList.map((product) => (
          <ProductsCard
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
      </ul>
    </Box>
  );
}
