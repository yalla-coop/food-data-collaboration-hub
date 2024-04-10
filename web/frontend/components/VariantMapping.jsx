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
import { VariantCard } from '../components/VariantCard';

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
  producerProductMapping,
  setVariantsMappingData,
  existingProductVariant,
  isCurrentSalesSessionActive,
  setIsProductPriceChanged,
  isProductPriceChanged
}) {
  const isProductInStore = !!existingProductVariant?.producerVariantId;

  const retailProducerProduct = producerProductMapping?.retailProduct;
  const wholesaleProducerProduct = producerProductMapping?.wholesaleProduct;
  const noOfItemPerCase = producerProductMapping.itemsPerWholesaleVariant;

  const existingProductVariantPrice = existingProductVariant?.price;

  const [addedValue, setAddedValue] = useState(existingProductVariant ? existingProductVariant.addedValue : calculateAddedValueForRRP());
  const [addedValueMethod, setAddedValueMethod] = useState(getAddingPriceMethodOption(
    existingProductVariant?.addedValueMethod
  ));

  const [pricedConfirmedCorrect, setPricesConfirmedCorrect] = useState(!!existingProductVariant);

  function calculateAddedValueForRRP() {
    return (
      Number(retailProducerProduct?.price) -
      Number(wholesaleProducerProduct?.price) / Number(noOfItemPerCase)
    ).toFixed(2);
  }

  const wholesaleCasePrice = Number(wholesaleProducerProduct?.price) || 0;
  const breakEvenItemPrice = Number(wholesaleCasePrice) / Number(noOfItemPerCase);

  const newMarkedUpPrice =
    addedValueMethod.value === 'fixed'
      ? Number(addedValue) + breakEvenItemPrice
      : breakEvenItemPrice + (breakEvenItemPrice * Number(addedValue)) / 100;

  const profitValue = (
    newMarkedUpPrice * noOfItemPerCase -
    Number(wholesaleProducerProduct?.price)
  ).toFixed(2);

  const boxSalesPrice = (noOfItemPerCase * newMarkedUpPrice).toFixed(2);

  const isFormValid = addedValue && addedValueMethod;
  const hasFormChanged = existingProductVariant && (existingProductVariant.addedValue?.toString() !== addedValue?.toString() || existingProductVariant.addedValueMethod !== addedValueMethod.value);

  useEffect(() => {
    setVariantsMappingData({
      valid: isFormValid && pricedConfirmedCorrect,
      changed: hasFormChanged,
      parentProduct: producerProductMapping.parentProduct,
      retailProduct: retailProducerProduct,
      wholesaleProduct: wholesaleProducerProduct,
      noOfItemPerCase,
      price: newMarkedUpPrice,
      originalPrice:
        Number(wholesaleProducerProduct.price / noOfItemPerCase) || 0,
      exitingNoOfItemPerCase: noOfItemPerCase,
      addedValue,
      addedValueMethod: addedValueMethod.value,
      profitValue,
      existingVariantId: existingProductVariant?.hubVariantId
    });
  }, [addedValue, addedValueMethod, pricedConfirmedCorrect]);

  const isThisVariantPriceChanged = isProductInStore && !hasFormChanged
    ? newMarkedUpPrice.toPrecision(2) !== Number(existingProductVariantPrice).toPrecision(2)
    : false;

  useEffect(() => {
    if (isProductInStore && isThisVariantPriceChanged) {
      setIsProductPriceChanged(true);
    }
  }, [isThisVariantPriceChanged, isProductInStore]);

  const markupNotEditable = (isProductInStore && isCurrentSalesSessionActive) || (!isProductInStore && !isCurrentSalesSessionActive);

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

      {isProductInStore && isCurrentSalesSessionActive &&
        <Alert severity="info">
          Product cannot be amended during an active sales session
        </Alert>
      }

      {!isProductInStore && !isCurrentSalesSessionActive &&
        <Alert severity="info">
          Product cannot be added to store outside an active sales session
        </Alert>
      }

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
          <Typography>Variant to be displayed on this store</Typography>
          <VariantCard variant={retailProducerProduct} />
        </Stack>

        <Stack flexGrow={1} spacing="10px">
          <Typography>Variant to be ordered from the producer</Typography>
          <VariantCard variant={wholesaleProducerProduct} />
        </Stack>
      </Stack>

      <Stack
        spacing="10px"
      >
        <Stack direction="row" spacing="6px" alignItems="center" sx={{
          opacity: isProductInStore ? 0.6 : 1
        }}>
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
          <Typography>No. of items per Case/Box/Package: {noOfItemPerCase}</Typography>
        </Stack>

        <Divider />

        <Stack direction="row" spacing="6px" alignItems="center"
          sx={{
            opacity: markupNotEditable ? 0.6 : 1
          }}
        >
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

        <Stack direction="row" spacing="20px" width="100%"
          sx={{
            pointerEvents: markupNotEditable ? 'none' : 'auto',
            opacity: markupNotEditable ? 0.6 : 1
          }}
        >
          <TextField
            sx={{
              flexGrow: 1
            }}
            error={
              addedValue &&
              newMarkedUpPrice.toFixed(2) < Number(retailProducerProduct?.price)
            }
            helperText={
              newMarkedUpPrice.toFixed(2) < Number(retailProducerProduct?.price) &&
              'The price of the mapped variant is less than the RRP of the variant to display on my store'
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
            value={newMarkedUpPrice.toFixed(2)}
          />
        </Stack>
        <Divider />
        <TextField
          type="number"
          variant="filled"
          label="Box Price"
          value={boxSalesPrice}
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

        <Stack direction="row" spacing="20px" width="100%"
          sx={{
            pointerEvents: markupNotEditable ? 'none' : 'auto',
            opacity: markupNotEditable ? 0.6 : 1
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={pricedConfirmedCorrect}
                disabled={!isFormValid}
                onChange={(event) => setPricesConfirmedCorrect(event.target.checked)}
              />
            }
            label="I confirm that the above prices are correct"
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export { VariantMappingComponent };
