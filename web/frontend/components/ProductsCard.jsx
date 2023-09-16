import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { Checkbox } from '@shopify/polaris';
import { useAppMutation, useAppQuery } from '../hooks';
import { VariantCard } from '../components/VariantCard';

const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop(), 10);
};

let productInfoFromTheStore;
export function ProductsCard({ product, exitingProductsList }) {
  const queryClient = useQueryClient();

  const { data: currentSalesSessionData } = useAppQuery({
    url: '/api/sales-session',
    fetchInit: {
      method: 'GET'
    }
  });

  const isCurrentSalesSessionActive =
    currentSalesSessionData?.currentSalesSession?.isActive;

  const [productsVariantsPrices, setProductsVariantsPrices] = useState({
    [product.id]: {}
  });

  const isProductInStore = exitingProductsList.some(
    (exitingProduct) =>
      convertShopifyGraphQLIdToNumber(product.id) ===
      Number(exitingProduct.producerProductId)
  );

  if (isProductInStore) {
    productInfoFromTheStore = exitingProductsList.find(
      (exitingProduct) =>
        convertShopifyGraphQLIdToNumber(product.id) ===
        Number(exitingProduct.producerProductId)
    );
  }

  const {
    mutateAsync: createShopifyProduct,
    isLoading: createShopifyProductLoading
  } = useAppMutation({
    reactQueryOptions: {
      onSuccess: async () => {
        await queryClient.invalidateQueries('/api/products');
      }
    }
  });

  const handleAddToStore = async (modifiedProduct, prices) => {
    const {
      title,
      handle,
      variants: { list: variants },
      id: producerProductId
    } = modifiedProduct;

    await createShopifyProduct({
      url: '/api/products/shopify',
      fetchInit: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          handle,
          variants: variants.map((variant) => ({
            ...variant,
            price: prices[variant.id].price.toFixed(2),
            option1: variant.title,
            addedValueMethod: prices[variant.id].addedValueMethod,
            addedValue: prices[variant.id].addedValue,
            originalPrice: prices[variant.id].originalPrice
          })),
          producerProductId
        })
      }
    });
  };

  return (
    <li
      key={product.title}
      style={{
        borderBottom: '2px solid black'
      }}
    >
      {isCurrentSalesSessionActive && (
        <>
          <Checkbox checked={isProductInStore} />
          <button
            type="button"
            disabled={
              createShopifyProductLoading ||
              isProductInStore ||
              !isCurrentSalesSessionActive
            }
            onClick={() => handleAddToStore(product, productsVariantsPrices)}
          >
            Add to my store
          </button>
        </>
      )}

      <p>{product.title}</p>
      <ul>
        {product.variants.list.map((variant, idx) => (
          <VariantCard
            isCurrentSalesSessionActive={isCurrentSalesSessionActive}
            variant={variant}
            index={idx}
            productsVariantsPrices={productsVariantsPrices}
            setProductsVariantsPrices={setProductsVariantsPrices}
            isProductInStore={isProductInStore}
            productInfoFromTheStore={productInfoFromTheStore}
          />
        ))}
      </ul>
    </li>
  );
}
