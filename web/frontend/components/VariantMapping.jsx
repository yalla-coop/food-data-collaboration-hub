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
  existingProductVariant,
  isCurrentSalesSessionActive,
  setIsProductPriceChanged,
  isProductPriceChanged
}) {
  const isProductInStore = !!existingProductVariant?.producerVariantId;

  const exitingVariantA =
    product?.variants?.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        Number(existingProductVariant?.producerVariantId)
    ) || null;

  const exitingVariantB =
    product?.variants?.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        Number(existingProductVariant?.mappedVariantId)
    ) || null;

  const noOfItemPerCase = existingProductVariant.noOfItemsPerPackage;
  const existingProductVariantPrice = existingProductVariant?.price;

  const [addedValue, setAddedValue] = useState(existingProductVariant.addedValue || '');
  const [addedValueMethod, setAddedValueMethod] = useState(getAddingPriceMethodOption(
      existingProductVariant?.addedValueMethod
    )
  );

  useEffect(() => {
    if (
      addedValue === ''
    ) {
      setAddedValue(
        (
          Number(exitingVariantA?.price) -
          Number(exitingVariantB?.price) / Number(noOfItemPerCase)
        ).toFixed(2)
      );
    }
  }, [
    addedValue,
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
      addedValue &&
      addedValueMethod
    ) {
      return true;
    }
    return false;
  };

  const isThisVariantPriceChanged = isProductInStore
    ? calculateThePrice({
      originalPrice: Number(exitingVariantB?.price) || 0,
      _addingPriceType: addedValueMethod,
      markUpValue: Number(addedValue),
      noOfItemsPerPackage: Number(noOfItemPerCase)
    }).toPrecision(2) !== Number(existingProductVariantPrice).toPrecision(2)
    : false;

  useEffect(() => {
    if (isProductInStore && isThisVariantPriceChanged) {
      setIsProductPriceChanged(true);
    }
  }, [isThisVariantPriceChanged, isProductInStore]);

  const itemNewPrice = isProductInStore
    ? Number(existingProductVariantPrice)
    : calculateThePrice({
      originalPrice: Number(exitingVariantB?.price) || 0,
      _addingPriceType: addedValueMethod,
      markUpValue: Number(addedValue),
      noOfItemsPerPackage: Number(noOfItemPerCase)
    });

  const profitValue = (
    itemNewPrice * noOfItemPerCase -
    Number(exitingVariantB?.price)
  ).toFixed(2);

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
          <Typography>{exitingVariantA}</Typography>
        </Stack>

        <Stack flexGrow={1} spacing="10px">
          <Typography>Variant to Order from producer</Typography>
          <Typography>{exitingVariantB}</Typography>
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

        <Typography>No. of items per Case/Box/Package: {noOfItemPerCase}</Typography>

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
              addedValue &&
              itemNewPrice.toFixed(2) < Number(exitingVariantA?.price)
            }
            helperText={
              itemNewPrice.toFixed(2) < Number(exitingVariantA?.price) &&
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
          error={profitValue < 0}
          helperText={
            profitValue < 0 && 'Profit is negative, please check the prices'
          }
          value={profitValue}
          disabled
        />

        <Divider />

        {isCurrentSalesSessionActive ? (
          <Stack spacing="12px">
            <Typography>
              Number of excess items:
              <Typography variant="span" ml="4px">
                {existingProductVariant?.numberOfExcessOrders || 0}
              </Typography>
            </Typography>
          </Stack>
        ) : null}

        <FormControlLabel
          control={
            <Checkbox
              checked={existingProductVariant?.producerVariantId && true}
              disabled={
                !isFormValid()
              }
              onChange={(_e) => {
                if (_e.target.checked) {
                  setVariantsMappingData((prev) => [
                    ...prev,
                    {
                      variantA: exitingVariantA,
                      variantB: exitingVariantB,
                      price: itemNewPrice,
                      originalPrice:
                        Number(exitingVariantB.price / noOfItemPerCase) || 0,
                        exitingNoOfItemPerCase: noOfItemPerCase,
                      addedValue,
                      addedValueMethod: addedValueMethod.value,
                      profitValue
                    }
                  ]);
                } else {
                  setVariantsMappingData((prev) =>
                    prev.filter((v) => v.variantA.id !== exitingVariantA.id)
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
