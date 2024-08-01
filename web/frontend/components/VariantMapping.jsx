/* eslint-disable no-nested-ternary */
/* eslint-disable function-paren-newline */
import { useEffect, useState } from 'react';
import {
  Box,
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

const VariantMappingDetails = ({
  isProductInStore,
  isCurrentSalesSessionActive,
  markupNotEditable,
  noOfItemPerCase,
  retailProducerProduct,
  addedValue,
  setAddedValue,
  addedValueMethod,
  setAddedValueMethod,
  newMarkedUpPrice,
  boxSalesPrice,
  profitValue,
  existingProductVariant,
  pricedConfirmedCorrect,
  setPricesConfirmedCorrect,
  isFormValid
}) => {
  return (
    <Stack spacing={2}>
      <Box
        style={{
          padding: '10px 20px',
          margin: '20px 0',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            opacity: isProductInStore ? 0.6 : 1
          }}
        >
          <Typography variant="h5" style={{ color: '#333' }}>
            Mapped Variant Ratio
          </Typography>
          <CustomTooltip
            title={
              <Typography variant="body2">
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
        <Typography variant="body1">
          No. of items per Case/Box/Package: {noOfItemPerCase}
        </Typography>
      </Box>

      <Divider />

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          opacity: markupNotEditable ? 0.6 : 1
        }}
      >
        <Typography variant="h5" color="textPrimary">
          Markup
        </Typography>
        <CustomTooltip
          title={
            <Typography variant="body2">
              A number that indicates the markup value that will be added to the
              price of the mapped variant
            </Typography>
          }
        >
          <IconButton>
            <InfoIcon />
          </IconButton>
        </CustomTooltip>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        width="100%"
        sx={{
          pointerEvents: markupNotEditable ? 'none' : 'auto',
          opacity: markupNotEditable ? 0.6 : 1
        }}
      >
        <TextField
          sx={{ flexGrow: 1 }}
          error={
            addedValue &&
            newMarkedUpPrice.toFixed(2) < Number(retailProducerProduct?.price)
          }
          helperText={
            newMarkedUpPrice.toFixed(2) <
              Number(retailProducerProduct?.price) &&
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
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          type="number"
          variant="filled"
          label="Box Price"
          value={boxSalesPrice}
          disabled
          style={{ width: '200px' }}
        />
        <TextField
          variant="filled"
          label="Profit"
          error={profitValue < 0}
          helperText={
            profitValue < 0 && 'Profit is negative, please check the prices'
          }
          value={profitValue}
          disabled
          style={{ width: '200px' }}
        />
      </Stack>

      <Divider />

      {isCurrentSalesSessionActive && (
        <Stack spacing={1}>
          <Typography>
            Number of excess items:
            <Typography variant="body1" component="span" ml={1}>
              {existingProductVariant?.numberOfExcessOrders || 0}
            </Typography>
          </Typography>
        </Stack>
      )}

      <Stack
        direction="row"
        spacing={2}
        width="100%"
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
              onChange={(event) =>
                setPricesConfirmedCorrect(event.target.checked)
              }
            />
          }
          label="I confirm that the above prices are correct"
        />
      </Stack>
    </Stack>
  );
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

  const [addedValue, setAddedValue] = useState(
    existingProductVariant
      ? existingProductVariant.addedValue
      : calculateAddedValueForRRP()
  );
  const [addedValueMethod, setAddedValueMethod] = useState(
    getAddingPriceMethodOption(existingProductVariant?.addedValueMethod)
  );

  const [pricedConfirmedCorrect, setPricesConfirmedCorrect] = useState(
    !!existingProductVariant
  );

  function calculateAddedValueForRRP() {
    return (
      Number(retailProducerProduct?.price) -
      Number(wholesaleProducerProduct?.price) / Number(noOfItemPerCase)
    ).toFixed(2);
  }

  const wholesaleCasePrice = Number(wholesaleProducerProduct?.price) || 0;
  const breakEvenItemPrice =
    Number(wholesaleCasePrice) / Number(noOfItemPerCase);

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
  const hasFormChanged =
    existingProductVariant &&
    (existingProductVariant.addedValue?.toString() !== addedValue?.toString() ||
      existingProductVariant.addedValueMethod !== addedValueMethod.value);

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

  const isThisVariantPriceChanged =
    isProductInStore && !hasFormChanged
      ? newMarkedUpPrice.toPrecision(2) !==
        Number(existingProductVariantPrice).toPrecision(2)
      : false;

  useEffect(() => {
    if (isProductInStore && isThisVariantPriceChanged) {
      setIsProductPriceChanged(true);
    }
  }, [isThisVariantPriceChanged, isProductInStore]);

  const markupNotEditable =
    (isProductInStore && isCurrentSalesSessionActive) ||
    (!isProductInStore && !isCurrentSalesSessionActive);

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

      {isProductInStore && isCurrentSalesSessionActive && (
        <Alert severity="info">
          Product cannot be amended during an active sales session
        </Alert>
      )}

      {!isProductInStore && !isCurrentSalesSessionActive && (
        <Alert severity="info">
          Product cannot be added to store outside an active sales session
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
          <Typography
            variant="body1"
            color="textPrimary"
            sx={{ marginBottom: '10px', paddingLeft: '10px' }}
          >
            Variant to be displayed on this store
          </Typography>
          <VariantCard variant={retailProducerProduct} />
        </Stack>

        <Stack flexGrow={1} spacing="10px">
          <Typography
            variant="body1"
            color="textPrimary"
            sx={{ marginBottom: '10px', paddingLeft: '10px' }}
          >
            Variant to be ordered from the producer
          </Typography>
          <VariantCard variant={wholesaleProducerProduct} />
        </Stack>
      </Stack>
      <VariantMappingDetails
        isProductInStore={isProductInStore}
        isCurrentSalesSessionActive={isCurrentSalesSessionActive}
        markupNotEditable={markupNotEditable}
        noOfItemPerCase={noOfItemPerCase}
        retailProducerProduct={retailProducerProduct}
        addedValue={addedValue}
        setAddedValue={setAddedValue}
        addedValueMethod={addedValueMethod}
        setAddedValueMethod={setAddedValueMethod}
        newMarkedUpPrice={newMarkedUpPrice}
        boxSalesPrice={boxSalesPrice}
        profitValue={profitValue}
        existingProductVariant={existingProductVariant}
        pricedConfirmedCorrect={pricedConfirmedCorrect}
        setPricesConfirmedCorrect={setPricesConfirmedCorrect}
        isFormValid={isFormValid}
      />
    </Stack>
  );
}

export { VariantMappingComponent };
