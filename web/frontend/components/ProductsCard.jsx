/* eslint-disable arrow-body-style */
/* eslint-disable react/function-component-definition */
import { useState } from 'react';
import {
  Stack,
  Typography,
  Button,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useQueryClient } from 'react-query';
import { useAppMutation, useAppQuery } from '../hooks';
import { VariantMappingComponent } from '../components/VariantMapping';

export function ProductsCard({ product, exitingProduct }) {
  const queryClient = useQueryClient();

  const exitingCount = exitingProduct?.variants?.length || 1;

  const [variantMappingCount, setVariantMappingCount] = useState(exitingCount);
  const [variantsMappingData, setVariantsMappingData] = useState([]);

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

  const isProductInStore = !!exitingProduct?.producerProductId;

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

  const handleAddToStore = async (modifiedProduct) => {
    const { title, handle, id: producerProductId } = modifiedProduct;

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
          customVariants: variantsMappingData,
          producerProductId
        })
      }
    });
  };

  return (
    <li
      key={product.title}
      style={{
        borderBottom: '2px solid black',
        padding: '12px',
        marginBottom: '12px',
        listStyle: 'none'
      }}
    >
      <Stack direction="row" justifyContent="space-between" p="12px">
        <Typography variant="h3" mb="12px">
          {product.title}
        </Typography>

        {isCurrentSalesSessionActive && (
          <Stack spacing="12px" direction="row">
            <FormControlLabel
              control={<Checkbox checked={isProductInStore} disabled />}
              label={isProductInStore ? 'In store' : 'Not in store'}
            />
            <Button
              variant="contained"
              type="button"
              disabled={
                createShopifyProductLoading ||
                isProductInStore ||
                !isCurrentSalesSessionActive ||
                variantMappingCount !== variantsMappingData.length
              }
              onClick={() => handleAddToStore(product, productsVariantsPrices)}
            >
              {createShopifyProductLoading ? 'Loading...' : 'Add to store'}
            </Button>
          </Stack>
        )}
      </Stack>

      <Stack
        spacing="12px"
        sx={{
          pointerEvents: isProductInStore ? 'none' : 'auto',
          opacity: isProductInStore ? 0.5 : 1
        }}
      >
        <Stack spacing="12px">
          {[...Array(variantMappingCount)].map((_, index) => (
            <VariantMappingComponent
              setVariantsMappingData={setVariantsMappingData}
              isCurrentSalesSessionActive={isCurrentSalesSessionActive}
              isProductInStore={isProductInStore}
              product={product}
              productsVariantsPrices={productsVariantsPrices}
              setProductsVariantsPrices={setProductsVariantsPrices}
              exitingProductVariant={exitingProduct?.variants?.[index] || {}}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing="12px">
          {variantMappingCount > 0 && (
            <Button
              variant="contained"
              type="button"
              onClick={() => setVariantMappingCount(variantMappingCount - 1)}
            >
              Remove variant
            </Button>
          )}

          <Button
            variant="contained"
            type="button"
            onClick={() => setVariantMappingCount(variantMappingCount + 1)}
          >
            Add more variants
          </Button>
        </Stack>
      </Stack>
    </li>
  );
}
