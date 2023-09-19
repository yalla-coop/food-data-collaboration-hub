/* eslint-disable function-paren-newline */
import { useState } from 'react';
import {
  Stack,
  TextField,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { VariantCard } from '../components/VariantCard';

import { convertShopifyGraphQLIdToNumber } from '../utils/index.js';

const getAddingPriceMethodOption = (value) => {
  if (value === 'percentage') {
    return {
      value: 'percentage',
      label: 'Increase price by %'
    };
  }
  return {
    value: 'fixed',
    label: 'Increase price by'
  };
};

function VariantMappingComponent({
  product,
  isCurrentSalesSessionActive,
  productsVariantsPrices,
  setProductsVariantsPrices,
  isProductInStore,
  productInfoFromTheStore,
  setVariantsMappingData,
  exitingProductVariant
}) {
  const exitingVariantA =
    product?.variants?.list?.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        Number(exitingProductVariant?.producerVariantId)
    ) || null;

  const exitingVariantB =
    product?.variants?.list?.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        Number(exitingProductVariant?.mappedVariantId)
    ) || null;

  const exitingNoOfItemPerCase = exitingProductVariant?.noOfItemsPerPackage;
  const exitingAddedValue = exitingProductVariant?.addedValue;
  const exitingAddedValueMethod = getAddingPriceMethodOption(
    exitingProductVariant?.addedValueMethod
  );

  const [selectedVariantA, setSelectedVariantA] = useState(exitingVariantA);
  const [selectedVariantB, setSelectedVariantB] = useState(exitingVariantB);
  const [noOfItemPerCase, setNoOfItemPerCase] = useState(
    exitingNoOfItemPerCase
  );
  const [addedValue, setAddedValue] = useState(exitingAddedValue);
  const [addedValueMethod, setAddedValueMethod] = useState(
    exitingAddedValueMethod
  );

  const calculateThePrice = ({
    originalPrice,
    _addingPriceType,
    _priceOfItem
  }) => {
    const increasedPrice =
      _addingPriceType.value === 'fixed'
        ? Number(_priceOfItem) + originalPrice
        : originalPrice + (originalPrice * Number(_priceOfItem)) / 100;

    return increasedPrice;
  };

  const isFormValid = () => {
    if (
      selectedVariantA &&
      selectedVariantB &&
      noOfItemPerCase &&
      addedValue &&
      addedValueMethod
    ) {
      return true;
    }
    return false;
  };

  const profitValue =
    (selectedVariantA &&
      selectedVariantA?.price &&
      calculateThePrice({
        originalPrice: Number(selectedVariantA?.price) || 0,
        _addingPriceType: addedValueMethod,
        _priceOfItem: Number(addedValue)
      }) *
        noOfItemPerCase -
        Number(selectedVariantB?.price).toFixed(2)) ||
    0;

  return (
    <Stack spacing="16px" border="2px solid black" padding="12px">
      <Stack direction="row" spacing="20px" width="100%">
        <Stack flexGrow={1} spacing="10px">
          <Typography>Variant to display on my store</Typography>
          <TextField
            fullWidth
            label="Select"
            helperText="Please select a variant to display on my store"
            select
            value={selectedVariantA || ''}
            onChange={(_e) => {
              setSelectedVariantA(_e.target.value);
            }}
          >
            {product.variants.list.map((variant, idx) => (
              <MenuItem key={variant.id} value={variant}>
                <VariantCard
                  isCurrentSalesSessionActive={isCurrentSalesSessionActive}
                  variant={variant}
                  index={idx}
                  productsVariantsPrices={productsVariantsPrices}
                  setProductsVariantsPrices={setProductsVariantsPrices}
                  isProductInStore={isProductInStore}
                  productInfoFromTheStore={productInfoFromTheStore}
                />
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack flexGrow={1} spacing="10px">
          <Typography>Variant to Order from producer</Typography>
          <TextField
            fullWidth
            label="Select"
            helperText="Please select a variant to order from producer"
            select
            value={selectedVariantB || ''}
            onChange={(event) => setSelectedVariantB(event.target.value)}
          >
            {product.variants.list.map((variant, idx) => (
              <MenuItem key={variant.id} value={variant}>
                <VariantCard
                  isCurrentSalesSessionActive={isCurrentSalesSessionActive}
                  variant={variant}
                  index={idx}
                  productsVariantsPrices={productsVariantsPrices}
                  setProductsVariantsPrices={setProductsVariantsPrices}
                  isProductInStore={isProductInStore}
                  productInfoFromTheStore={productInfoFromTheStore}
                />
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Stack spacing="10px">
        <Typography>Prices</Typography>
        <TextField
          type="number"
          label="No. of items per Case/Box"
          inputProps={{ inputMode: 'numeric', min: 0, pattern: '[0-9]*' }}
          value={noOfItemPerCase}
          onChange={(e) => setNoOfItemPerCase(e.target.value)}
        />
        <Stack direction="row" spacing="20px" width="100%">
          <TextField
            sx={{
              flexGrow: 1
            }}
            type="number"
            inputProps={{ inputMode: 'numeric', min: 0, pattern: '[0-9]*' }}
            label="Adding Price Value/Percentage"
            value={addedValue}
            onChange={(e) => setAddedValue(e.target.value)}
          />

          <TextField
            select
            label="Adding Price Type"
            value={addedValueMethod.value}
            onChange={(e) =>
              setAddedValueMethod({
                value: e.target.value,
                label:
                  e.target.value === 'fixed'
                    ? 'Increase price by'
                    : 'Increase price by %'
              })
            }
            defaultValue="fixed"
          >
            <MenuItem value="fixed">Increase price by</MenuItem>
            <MenuItem value="percentage">Increase price by %</MenuItem>
          </TextField>
          <TextField
            type="number"
            inputProps={{ inputMode: 'numeric', min: 0, pattern: '[0-9]*' }}
            label="New Item Price"
            disabled
            variant="filled"
            value={calculateThePrice({
              originalPrice: Number(selectedVariantA?.price) || 0,
              _addingPriceType: addedValueMethod,
              _priceOfItem: Number(addedValue)
            })}
          />
        </Stack>
        <TextField
          type="number"
          variant="filled"
          label="Box Price"
          value={
            noOfItemPerCase *
            calculateThePrice({
              originalPrice: Number(selectedVariantA?.price) || 0,
              _addingPriceType: addedValueMethod,
              _priceOfItem: Number(addedValue)
            })
          }
          disabled
        />
        {/* {This calculated as fixed price} */}
        <TextField
          variant="filled"
          label="Profit"
          error={profitValue < 0}
          helperText={
            profitValue <= 0 && 'Profit is negative, please check the prices'
          }
          value={profitValue}
          disabled
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={exitingProductVariant?.producerVariantId && true}
              disabled={!isFormValid() || profitValue <= 0}
              onChange={(_e) => {
                if (_e.target.checked) {
                  setVariantsMappingData((prev) => [
                    ...prev,
                    {
                      variantA: selectedVariantA,
                      variantB: selectedVariantB,
                      price: calculateThePrice({
                        originalPrice: Number(selectedVariantA?.price) || 0,
                        _addingPriceType: addedValueMethod,
                        _priceOfItem: Number(addedValue)
                      }),
                      originalPrice: Number(selectedVariantA?.price) || 0,
                      noOfItemPerCase,
                      addedValue,
                      addedValueMethod: addedValueMethod.value,
                      profitValue
                    }
                  ]);
                } else {
                  setVariantsMappingData((prev) =>
                    prev.filter((v) => v.variantA.id !== selectedVariantA.id)
                  );
                }
              }}
            />
          }
          label="I confirm that the above prices are correct"
        />
      </Stack>
    </Stack>
  );
}

export { VariantMappingComponent };
