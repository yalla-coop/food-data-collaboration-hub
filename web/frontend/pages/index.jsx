import { useState, useEffect } from 'react';
import { useAppQuery, useAppMutation } from '../hooks';
import { useQueryClient } from 'react-query';
import { Checkbox } from '@shopify/polaris';

const PRODUCER_SHOP_URL =
  typeof process !== 'undefined'
    ? process.env.PRODUCER_SHOP_URL
    : 'https://food-data-collaboration-produc-fe870152f634.herokuapp.com/';
const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop());
};
export default function Home() {
  const [nextPageCursorValue, setNextPageCursorValue] = useState(null);
  const [productsList, setProductsList] = useState([]);

  const queryClient = useQueryClient();

  const [exitingProductsList, setExitingProductsList] = useState([]);

  const {
    mutateAsync: createShopifyProduct,
    isLoading: createShopifyProductLoading,
    error: createShopifyProductError,
    isSuccess: createShopifyProductSuccess
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries('/api/products');
      }
    }
  });

  const { isLoading: exitingProductsIsLoading } = useAppQuery({
    url: '/api/products',
    reactQueryOptions: {
      onSuccess: (data) => {
        setExitingProductsList(data);
      }
    }
  });

  const { data, isLoading } = useAppQuery({
    reactQueryOptions: {
      onSuccess: (data) => {
        setProductsList([...productsList, ...data.products.list]);
      }
    },
    url: `${PRODUCER_SHOP_URL}fdc/products?shop=test-hodmedod.myshopify.com&nextPageCursor=${nextPageCursorValue}`
  });

  if ((productsList.length === 0 && isLoading) || exitingProductsIsLoading) {
    return <div>Loading...</div>;
  }

  const { products: { pageInfo = {}, list = [] } = {} } = data || {};

  if (!data || !data?.products || !data?.products?.list || list.length === 0)
    return (
      <div>
        <p>
          Something went wrong, please check the producer server - maybe the
          server is down
        </p>
      </div>
    );

  const handleShowMore = () => {
    if (!pageInfo?.hasNextPage) return;
    setNextPageCursorValue(pageInfo?.startCursor);
  };

  const handleAddToStore = async (product) => {
    const {
      title,
      handle,
      variants: { list: variants },
      id: producerProductId
    } = product;

    await createShopifyProduct({
      url: `/api/products/shopify`,
      fetchInit: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          handle,
          variants: variants.map((variant) => ({
            id: variant.id,
            price: variant.price,
            option1: variant.title
          })),
          producerProductId
        })
      }
    });
  };

  return (
    <div>
      <button onClick={handleShowMore} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Show More'}
      </button>

      {createShopifyProductSuccess && <p>Product added to store!</p>}
      {createShopifyProductError?.error && (
        <p>{createShopifyProductError?.error}</p>
      )}
      <h1>Products</h1>
      <ul>
        {productsList.map((product) => (
          <li key={product.title}>
            <p>{product.title}</p>
            <p>{product.id}</p>
            <ul>
              {product.variants.list.map((variant, idx) => (
                <li
                  key={variant.id}
                  style={{
                    border: '1px solid black',
                    margin: '10px',
                    padding: '10px',
                    backgroundColor: idx % 2 === 0 ? 'lightgray' : 'white'
                  }}
                >
                  <p>
                    <strong>title:</strong>
                    {variant.title}
                  </p>
                  <p>
                    <strong>price:</strong>
                    {variant.price}
                  </p>
                  <p>
                    <strong>inventoryPolicy:</strong>
                    {variant.inventoryPolicy}
                  </p>
                  <p>
                    <strong>availableForSale:</strong>
                    {variant.availableForSale}
                  </p>
                </li>
              ))}
            </ul>

            <Checkbox
              checked={exitingProductsList.some(
                (exitingProduct) =>
                  convertShopifyGraphQLIdToNumber(product.id) ===
                  Number(exitingProduct.producerProductId)
              )}
            />

            <button
              disabled={
                createShopifyProductLoading ||
                exitingProductsList.some(
                  (exitingProduct) =>
                    convertShopifyGraphQLIdToNumber(product.id) ===
                    Number(exitingProduct.producerProductId)
                )
              }
              onClick={() => handleAddToStore(product)}
            >
              Add to my store
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
