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

export function ProductsCard({ producerProduct, existingProduct }) {
  const queryClient = useQueryClient();

  const [isProductPriceChanged, setIsProductPriceChanged] = useState(false);
  const [variantsMappingData, setVariantsMappingData] = useState(null);

  const { data: currentSalesSessionData } = useAppQuery({
    url: '/api/sales-session',
    fetchInit: {
      method: 'GET'
    }
  });

  const isCurrentSalesSessionActive =
    currentSalesSessionData?.currentSalesSession?.isActive;

  const isProductInStore = !!existingProduct?.producerProductId;

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

  const addToStoreOrUpdate = async () => {
    const { title, id: producerProductId } = producerProduct.retailProduct;

    const url = variantsMappingData.existingVariantId
      ? `/api/products/shopify/${variantsMappingData.existingVariantId}`
      : '/api/products/shopify';

    await createShopifyProduct({
      url: url,
      fetchInit: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          variantsMappingData,
          producerProductId
        })
      }
    });
  };

  const numberOfExistingProductVariants =
    existingProduct?.variants?.length || 0;

  const numberOfExcessOutstandingItems =
    existingProduct?.variants?.reduce((acc, v) => {
      const addedValue = v?.numberOfExcessOrders || 0;

      acc = acc + addedValue;

      return acc;
    }, 0) || 0;

  return (
    <Accordion key={producerProduct.retailProduct.title}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Typography variant="h6">
            {producerProduct.retailProduct.title}
          </Typography>

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

              {existingProduct?.variants?.length > 0 && (
                <Tooltip title="Number of variants">
                  <Badge
                    badgeContent={numberOfExistingProductVariants}
                    color="secondary"
                  >
                    <ProductsIcon />
                  </Badge>
                </Tooltip>
              )}
              {existingProduct?.variants?.length > 0 && (
                <Tooltip title={`Number of excess items`}>
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
            <VariantMappingComponent
              isProductPriceChanged={isProductPriceChanged}
              setIsProductPriceChanged={setIsProductPriceChanged}
              setVariantsMappingData={setVariantsMappingData}
              isCurrentSalesSessionActive={isCurrentSalesSessionActive}
              producerProductMapping={producerProduct}
              existingProductVariant={
                existingProduct?.variants ? existingProduct?.variants[0] : null
              }
            />
          </Stack>

          {isProductInStore &&
            variantsMappingData?.changed &&
            variantsMappingData?.valid && (
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{
                  pointerEvents: isCurrentSalesSessionActive ? 'none' : 'auto',
                  opacity: isCurrentSalesSessionActive ? 0.6 : 1
                }}
              >
                <Button
                  variant="contained"
                  type="button"
                  disabled={
                    createShopifyProductLoading || isCurrentSalesSessionActive
                  }
                  onClick={addToStoreOrUpdate}
                >
                  {createShopifyProductLoading ? 'Loading...' : 'Save changes'}
                </Button>
              </Stack>
            )}

          {!isProductInStore && (
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{
                pointerEvents: isCurrentSalesSessionActive ? 'auto' : 'none',
                opacity: isCurrentSalesSessionActive ? 1 : 0.6
              }}
            >
              <Button
                variant="contained"
                type="button"
                disabled={
                  createShopifyProductLoading ||
                  isProductInStore ||
                  !variantsMappingData ||
                  !variantsMappingData.valid ||
                  !isCurrentSalesSessionActive
                }
                onClick={addToStoreOrUpdate}
                style={{
                  padding: '10px 20px',
                  margin: '10px 0',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'background-color 0.3s ease',
                  opacity:
                    createShopifyProductLoading ||
                    isProductInStore ||
                    !variantsMappingData ||
                    !variantsMappingData.valid ||
                    !isCurrentSalesSessionActive
                      ? 0.5
                      : 1
                }}
              >
                {createShopifyProductLoading ? 'Loading...' : 'Add to store'}
              </Button>
            </Stack>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
