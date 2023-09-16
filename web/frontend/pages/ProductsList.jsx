import { useState } from 'react';
import { Redirect } from '@shopify/app-bridge/actions';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Alert } from '@mui/material';
import { useAppQuery } from '../hooks';
import { useAuth } from '../components/providers/AuthProvider';
import { ProductsCard } from '../components/ProductsCard';

export default function ProductsList() {
  const [nextPageCursorValue, setNextPageCursorValue] = useState(null);
  const [productsList, setProductsList] = useState([]);

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
    return <div>Loading...</div>;
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
    <div>
      <button type="button" onClick={handleShowMore} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Show More'}
      </button>

      <h1>Products</h1>

      {!isCurrentSalesSessionCreated && (
        <Alert severity="warning">
          There is no active sales session , please create one
        </Alert>
      )}

      {isCurrentSalesSessionCreated && !isCurrentSalesSessionActive && (
        <Alert severity="warning">
          There is no active sales session , please create one
        </Alert>
      )}

      <ul>
        {productsList.map((product) => (
          <ProductsCard
            product={product}
            exitingProductsList={exitingProductsList}
          />
        ))}
      </ul>
    </div>
  );
}
