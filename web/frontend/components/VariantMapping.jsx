/* eslint-disable no-nested-ternary */
/* eslint-disable function-paren-newline */
import { useEffect, useState } from 'react';
import {
  Stack,
  TextField,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton
} from '@mui/material';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useDebouncedValue } from '@shopify/react-hooks';
import { VariantCard } from '../components/VariantCard';
import { InfoIcon } from '../components/InfoIcon';
import { CustomTooltip } from '../components/CustomTooltip';
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
  setVariantsMappingData,
  exitingProductVariant,
  isPartiallySoldCasesEnabled,
  isCurrentSalesSessionActive,
  setIsProductPriceChanged,
  isProductPriceChanged
}) {
  const isProductInStore = !!exitingProductVariant?.producerVariantId;

  const exitingVariantA =
    product?.variants?.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        Number(exitingProductVariant?.producerVariantId)
    ) || null;

  const exitingVariantB =
    product?.variants?.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        Number(exitingProductVariant?.mappedVariantId)
    ) || null;

  const exitingNoOfItemPerCase = exitingProductVariant?.noOfItemsPerPackage;
  const exitingAddedValue = exitingProductVariant?.addedValue || '';
  const exitingAddedValueMethod = getAddingPriceMethodOption(
    exitingProductVariant?.addedValueMethod
  );

  const exitingProductVariantPrice = exitingProductVariant?.price;

  const [selectedVariantA, setSelectedVariantA] = useState(exitingVariantA);
  const [selectedVariantB, setSelectedVariantB] = useState(exitingVariantB);
  const [noOfItemPerCase, setNoOfItemPerCase] = useState(
    exitingNoOfItemPerCase
  );
  const [addedValue, setAddedValue] = useState(exitingAddedValue);
  const [addedValueMethod, setAddedValueMethod] = useState(
    exitingAddedValueMethod
  );

  const noOfItemPerCaseDebounced = useDebouncedValue(noOfItemPerCase, {
    timeoutMs: 400
  });

  useEffect(() => {
    if (
      selectedVariantA &&
      selectedVariantB &&
      noOfItemPerCaseDebounced &&
      addedValue === ''
    ) {
      setAddedValue(
        (
          Number(selectedVariantA?.price) -
          Number(selectedVariantB?.price) / Number(noOfItemPerCaseDebounced)
        ).toFixed(2)
      );
    }
  }, [
    selectedVariantA,
    selectedVariantB,
    addedValue,
    noOfItemPerCaseDebounced
  ]);

  const calculateThePrice = ({
    originalPrice,
    _addingPriceType,
    markUpValue = 0,
    noOfItemsPerPackage
  }) => {
    if (!originalPrice || !_addingPriceType || !noOfItemsPerPackage) return 0;

    const itemPrice = Number(originalPrice) / Number(noOfItemsPerPackage);

    if (noOfItemsPerPackage === 0) return 0;

    if (!markUpValue || markUpValue === 0) return itemPrice;

    const increasedPrice =
      _addingPriceType.value === 'fixed'
        ? Number(markUpValue) + itemPrice
        : itemPrice + (itemPrice * Number(markUpValue)) / 100;

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

  const isThisVariantPriceChanged = isProductInStore
    ? calculateThePrice({
        originalPrice: Number(selectedVariantB?.price) || 0,
        _addingPriceType: addedValueMethod,
        markUpValue: Number(addedValue),
        noOfItemsPerPackage: Number(noOfItemPerCase)
      }).toPrecision(2) !== Number(exitingProductVariantPrice).toPrecision(2)
    : false;

  useEffect(() => {
    if (isProductInStore && isThisVariantPriceChanged) {
      setIsProductPriceChanged(true);
    }
  }, [isThisVariantPriceChanged, isProductInStore]);

  const itemNewPrice = isProductInStore
    ? Number(exitingProductVariantPrice)
    : calculateThePrice({
        originalPrice: Number(selectedVariantB?.price) || 0,
        _addingPriceType: addedValueMethod,
        markUpValue: Number(addedValue),
        noOfItemsPerPackage: Number(noOfItemPerCase)
      });

  const profitValue =
    (selectedVariantB &&
      selectedVariantB?.price &&
      noOfItemPerCase &&
      (
        itemNewPrice * noOfItemPerCase -
        Number(selectedVariantB?.price)
      ).toFixed(2)) ||
    0;

  return (
    <Stack
      spacing="16px"
      border="2px solid #E0E0E0"
      borderRadius="12px"
      padding="12px"
    >
      {isProductPriceChanged && isThisVariantPriceChanged && (
        <Alert severity="warning">
          <AlertTitle>Warning</AlertTitle>
          The price of this variant changed — <strong>check it out!</strong>
        </Alert>
      )}

      <Stack
        direction="row"
        spacing="20px"
        width="100%"
        sx={{
          pointerEvents: isProductInStore ? 'none' : 'auto',
          opacity: isProductInStore ? 0.6 : 1
        }}
      >
        <Stack flexGrow={1} spacing="10px">
          <Typography>Variant to display on my store</Typography>
          <TextField
            fullWidth
            label="Select"
            helperText="Please select a variant to display on my store"
            select
            sx={{
              '& .MuiInputBase-root': {
                listStyle: 'none'
              }
            }}
            value={selectedVariantA || ''}
            onChange={(_e) => {
              setSelectedVariantA(_e.target.value);
            }}
          >
            {product.variants.map((variant, idx) => (
              <MenuItem key={variant.id} value={variant}>
                <VariantCard variant={variant} index={idx} />
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
            sx={{
              '& .MuiInputBase-root': {
                listStyle: 'none'
              }
            }}
            value={selectedVariantB || ''}
            onChange={(event) => setSelectedVariantB(event.target.value)}
          >
            {product.variants.map((variant, idx) => (
              <MenuItem key={variant.id} value={variant}>
                <VariantCard variant={variant} index={idx} />
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Stack
        spacing="10px"
        sx={{
          pointerEvents: isProductInStore ? 'none' : 'auto',
          opacity: isProductInStore ? 0.6 : 1
        }}
      >
        <Stack direction="row" spacing="6px" alignItems="center">
          <Typography variant="h5">Mapped Variant Ratio</Typography>
          <CustomTooltip
            title={
              <Typography variant="body1">
                A number that indicates the multiplier to apply before ordering
                another of the mapped variant (for example if a box/case has 6
                bottles and you're selling individual bottles, the number would
                be 6)
              </Typography>
            }
          >
            <IconButton>
              <InfoIcon />
            </IconButton>
          </CustomTooltip>
        </Stack>

        <TextField
          type="number"
          label="No. of items per Case/Box/Package"
          inputProps={{ inputMode: 'numeric', min: 0, pattern: '[0-9]*' }}
          value={noOfItemPerCase}
          onChange={(e) => setNoOfItemPerCase(e.target.value)}
        />

        <Divider />

        <Stack direction="row" spacing="6px" alignItems="center">
          <Typography variant="h5">Markup</Typography>
          <CustomTooltip
            title={
              <Typography variant="body1">
                A number that indicates the markup value that will be added to
                the price of the mapped variant
              </Typography>
            }
          >
            <IconButton>
              <InfoIcon />
            </IconButton>
          </CustomTooltip>
        </Stack>

        <Stack direction="row" spacing="20px" width="100%">
          <TextField
            sx={{
              flexGrow: 1
            }}
            error={
              selectedVariantA &&
              selectedVariantB &&
              addedValue &&
                itemNewPrice.toFixed(2) < Number(selectedVariantA?.price)
            }
            helperText={
              selectedVariantA &&
              selectedVariantB &&
                itemNewPrice.toFixed(2) < Number(selectedVariantA?.price) &&
              'The price of the mapped variant is less than the price of the variant to display on my store'
            }
            type="number"
            inputProps={{
              inputMode: 'numeric',
              min: 0,
              pattern: '[0-9]*',
              step: 0.1
            }}
            label="Markup : Adding Price Value/Percentage"
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
            value={itemNewPrice.toFixed(2)}
          />
        </Stack>
        <Divider />
        <TextField
          type="number"
          variant="filled"
          label="Box Price"
          value={(noOfItemPerCase * itemNewPrice).toFixed(2)}
          disabled
        />
        {/* {This calculated as fixed price} */}
        <TextField
          variant="filled"
          label="Profit"
          error={selectedVariantA && selectedVariantB && profitValue < 0}
          helperText={
            profitValue < 0 && 'Profit is negative, please check the prices'
          }
          value={profitValue}
          disabled
        />

        <Divider />

        {isCurrentSalesSessionActive && exitingVariantA && exitingVariantB ? (
          isPartiallySoldCasesEnabled ? (
            <Stack spacing="12px">
              <Typography>
                <strong>Partially Sold Cases</strong> are enabled for this
                product.
              </Typography>
              <Typography>
                Number of excess items:
                <Typography variant="span" ml="4px">
                  {exitingProductVariant?.numberOfExcessOrders || 0}
                </Typography>
              </Typography>
            </Stack>
          ) : (
            <Stack spacing="12px">
              <Typography>
                <strong>Partially Sold Cases</strong> are disabled for this
                product.
              </Typography>
              <Typography>
                Number of outstanding items:
                <Typography variant="span" ml="4px">
                  {exitingProductVariant?.numberOfRemainingOrders || 0}
                </Typography>
              </Typography>
            </Stack>
          )
        ) : null}

        <FormControlLabel
          control={
            <Checkbox
              checked={exitingProductVariant?.producerVariantId && true}
              disabled={
                !isFormValid()
              }
              onChange={(_e) => {
                if (_e.target.checked) {
                  setVariantsMappingData((prev) => [
                    ...prev,
                    {
                      variantA: selectedVariantA,
                      variantB: selectedVariantB,
                      price: itemNewPrice,
                      originalPrice:
                        Number(selectedVariantB?.price / noOfItemPerCase) || 0,
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
