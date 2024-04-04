/* eslint-disable no-nested-ternary */
import { useLayoutEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Redirect } from '@shopify/app-bridge/actions';
import Button from '@mui/material/Button';
import { useAppBridge } from '@shopify/app-bridge-react';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Alert, Box, CircularProgress, List, ListItem, ListItemText, } from '@mui/material';

import { useAppMutation, useAppQuery } from '../hooks';
import { useAuth } from '../components/providers/AuthProvider';
import { ProductsCard } from '../components/ProductsCard';
import { convertShopifyGraphQLIdToNumber } from '../utils/index.js';
import { Link } from 'react-router-dom';

export default function ProductsList() {
  const [productSinceId, setProductSinceId] = useState(0);
  const [
    remainingProductsCountBeforeNextFetch,
    setRemainingProductsCountBeforeNextFetch,
  ] = useState(0);
  const [producerProducts, setProducerProducts] = useState([]);
  const [hubProducts, setHubProducts] = useState([]);
  const [helpTextVisible, setHelpTextVisible] = useState(false);
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const { data: userAuthData } = useAuth();

  const { data: currentSalesSessionData } = useAppQuery({
    url: "/api/sales-session",
    fetchInit: {
      method: "GET",
    },
  });

  const { isFetching: exitingProductsIsLoading } = useAppQuery({
    url: "/api/products",
    reactQueryOptions: {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          setHubProducts(data);
        }
      },
    },
  });

  const {
    data: producerProductsData,
    isFetching: isLoading,
    error: getProductDataError,
  } = useAppQuery({
    reactQueryOptions: {},
    url: `/api/products/fdc?sinceId=${productSinceId}&remainingProductsCountBeforeNextFetch=${remainingProductsCountBeforeNextFetch || 0
      }`,
  });

  const {
    mutateAsync: logout,
    isLoading: logoutIsLoading,
    error: logoutError,
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        console.log("Loging out ...");
      },
    },
  });

  useLayoutEffect(() => {
    if (producerProductsData?.products) {
      setProducerProducts((prev) => [...prev, ...producerProductsData?.products]);
    }
  }, [producerProductsData]);

  if ((producerProducts.length === 0 && isLoading) || exitingProductsIsLoading) {
    return (
      <Stack
        sx={{
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={30} />
      </Stack>
    );
  } else if (getProductDataError) {
    console.error(getProductDataError);
    return (
      <>
        <Typography variant="h6">
          You need to login to be able to see the Product List.{" "}
          <Link to="/" replace>
            Click here
          </Link>{" "}
          to login to your account
        </Typography>
      </>
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
          p: "6px",
          position: "fixed",
          right: "80px",
          bottom: "16px",
          borderRadius: "16px",
          zIndex: 1000,
          textTransform: "none",
        }}
        variant="contained"
        onClick={async () => {
          logout({
            url: "/api/user/logout",
            fetchInit: {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            },
          });

          redirect.dispatch(Redirect.Action.APP, "/");
        }}
      >
        Logout
        {logoutIsLoading && (
          <CircularProgress
            color="white"
            size={20}
            sx={{ marginLeft: "10px" }}
          />
        )}
      </Button>
      <Button
        type="button"
        color="success"
        sx={{
          p: "6px",
          position: "fixed",
          right: "12px",
          bottom: "16px",
          borderRadius: "16px",
          zIndex: 1000,
          textTransform: "none",
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
          p: "16px",
          position: "fixed",
          borderRadius: "12px",
          boxShadow: "0px 0px 12px 0px rgba(0,0,0,0.75)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: "800px",
          backgroundColor: "white",
          zIndex: 100,
          visibility: helpTextVisible ? "visible" : "hidden",
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
            For example:{" "}
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
            p: "12px",
            margin: "0 auto",
            width: "200px",
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
            typography: "body1",
            fontSize: "20px",
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
            typography: "body1",
            fontSize: "20px",
          }}
        >
          There is no active sales session , please create one
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
            p: "12px",
            margin: "0 auto",
            width: "200px",
            display: "block",
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
            ? "Loading..."
            : !producerProductsData.remainingProductsCountAfter
              ? "No more products"
              : "Load more products"}
        </Button>
      </Stack>
    </Box>
  );
}
