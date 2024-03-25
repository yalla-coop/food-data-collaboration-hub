/* eslint-disable react/no-array-index-key */
/* eslint-disable arrow-body-style */
/* eslint-disable react/function-component-definition */
import { useState } from 'react';
import {
  Stack,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  IconButton
} from '@mui/material';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

import { ExpandMoreIcon } from '../components/ExpandMoreIcon';
import { WarningIcon } from '../components/WarningIcon';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { useQueryClient } from 'react-query';
import { useAppMutation, useAppQuery } from '../hooks';
import { VariantMappingComponent } from '../components/VariantMapping';
import { ItemsIcon } from './ItemsIcon';
import { ProductsIcon } from './ProductsIcon';

export function ProductsCard({ product, exitingProduct }) {
  const queryClient = useQueryClient();

  const [isProductPriceChanged, setIsProductPriceChanged] = useState(false);

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
          producerProductId,
          productData: modifiedProduct
        })
      }
    });
  };

  const numberOfExitingProductVariants = exitingProduct?.variants?.length || 0;

  const numberOfExcessOutstandingItems =
    exitingProduct?.variants?.reduce((acc, v) => {
      const addedValue = v?.numberOfExcessOrders || 0;

      acc = acc + addedValue;

      return acc;
    }, 0) || 0;

  return (
    <Accordion key={product.title}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Typography variant="h6">{product.title}</Typography>

          {isCurrentSalesSessionActive && (
            <Stack spacing="20px" direction="row" alignItems="center">
              {isProductInStore && isProductPriceChanged && (
                <Tooltip
                  title={`One of your variants price has changed, please update it`}
                >
                  <IconButton>
                    <WarningIcon />
                  </IconButton>
                </Tooltip>
              )}

              {exitingProduct?.variants?.length > 0 && (
                <Tooltip title="Number of variants">
                  <Badge
                    badgeContent={numberOfExitingProductVariants}
                    color="secondary"
                  >
                    <ProductsIcon />
                  </Badge>
                </Tooltip>
              )}
              {exitingProduct?.variants?.length > 0 && (
                <Tooltip
                  title={`Number of excess items`}
                >
                  <Badge
                    showZero
                    badgeContent={
                      numberOfExcessOutstandingItems === 0
                        ? 0
                        : `+${numberOfExcessOutstandingItems}`
                    }
                    color="primary"
                  >
                    <ItemsIcon />
                  </Badge>
                </Tooltip>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isProductInStore}
                    disabled
                    sx={{
                      '&.Mui-disabled': {
                        opacity: 1,
                        color: isProductInStore ? 'green' : 'gray'
                      }
                    }}
                  />
                }
                sx={{
                  '& .MuiFormControlLabel-label.Mui-disabled': {
                    color: isProductInStore ? 'green' : 'gray'
                  }
                }}
                label={isProductInStore ? 'In store' : 'Not in store'}
                labelPlacement="start"
              />
            </Stack>
          )}
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing="12px">
          <Stack spacing="12px">
            {[...Array(variantMappingCount)].map((_, index) => (
              <VariantMappingComponent
                isProductPriceChanged={isProductPriceChanged}
                setIsProductPriceChanged={setIsProductPriceChanged}
                key={index}
                setVariantsMappingData={setVariantsMappingData}
                isCurrentSalesSessionActive={isCurrentSalesSessionActive}
                product={product}
                exitingProductVariant={exitingProduct?.variants?.[index] || {}}
              />
            ))}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
              pointerEvents: isProductInStore ? 'none' : 'auto',
              opacity: isProductInStore ? 0.6 : 1
            }}
          >
            <Stack direction="row" spacing="12px">
              {variantMappingCount > 0 && (
                <Button
                  variant="contained"
                  type="button"
                  onClick={() =>
                    setVariantMappingCount(variantMappingCount - 1)
                  }
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
            <Button
              variant="contained"
              type="button"
              disabled={
                createShopifyProductLoading ||
                isProductInStore ||
                !isCurrentSalesSessionActive ||
                variantMappingCount !== variantsMappingData.length
              }
              onClick={() => handleAddToStore(product)}
            >
              {createShopifyProductLoading ? 'Loading...' : 'Add to store'}
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
