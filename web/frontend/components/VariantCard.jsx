import { useState, useCallback, useEffect } from 'react';
import { TextField, Select } from '@shopify/polaris';
import { convertShopifyGraphQLIdToNumber } from '../utils';

let variantDataFromTheStore = {};

function VariantCard({
  variant,
  index,
  setProductsVariantsPrices,
  productsVariantsPrices,
  isProductInStore,
  productInfoFromTheStore,
  isCurrentSalesSessionActive
}) {
  if (isProductInStore) {
    variantDataFromTheStore = productInfoFromTheStore?.variants.find(
      (exitingVariant) =>
        Number(exitingVariant.producerVariantId) ===
        convertShopifyGraphQLIdToNumber(variant.id)
    );
  }

  const [value, setValue] = useState(variantDataFromTheStore?.addedValue || 0);
  const [selected, setSelected] = useState(
    (isProductInStore &&
      (variantDataFromTheStore?.addedValueMethod === 'percentage'
        ? 'Increase price by %'
        : 'Increase price by')) ||
      'Increase price by'
  );

  const handleTextChange = useCallback(
    (newValue) => setValue(Number(newValue)),
    []
  );
  const handleSelectChange = useCallback(
    (newValue) => setSelected(newValue),
    []
  );

  useEffect(() => {
    const originalPrice = Number(variant.price) || 0;

    const increasedPrice =
      selected === 'Increase price by'
        ? value + originalPrice
        : originalPrice + (originalPrice * value) / 100;

    setProductsVariantsPrices((prev) => ({
      ...prev,
      [variant.id]: {
        originalPrice,
        price: increasedPrice,
        variantId: variant.id,
        addedValueMethod:
          selected === 'Increase price by' ? 'fixed' : 'percentage',
        addedValue: value
      }
    }));
  }, [value, selected, setProductsVariantsPrices, variant.price]);

  return (
    <li
      key={variant.id}
      style={{
        border: '1px solid black',
        margin: '10px',
        borderRadius: '8px',
        padding: '10px',
        backgroundColor: index % 2 === 0 ? 'lightgray' : 'white'
      }}
    >
      {isCurrentSalesSessionActive && (
        <TextField
          disabled={isProductInStore}
          label="Price"
          type="number"
          min={0}
          labelHidden
          value={value}
          onChange={handleTextChange}
          autoComplete="off"
          connectedRight={
            <Select
              value={selected}
              label="How much customers will pay"
              labelHidden
              onChange={handleSelectChange}
              options={['Increase price by', 'Increase price by %']}
            />
          }
        />
      )}

      <p>
        <strong>title:</strong>
        {variant.title}
      </p>
      {isCurrentSalesSessionActive &&
        isProductInStore &&
        Number(variantDataFromTheStore?.originalPrice) !==
          Number(variant.price) && (
          <p
            style={{
              color: 'red'
            }}
          >
            Attention : The product original price changed , the new price is:
            <strong>{variant.price}</strong>
          </p>
        )}
      <p>
        <strong>price:</strong>
        {isProductInStore
          ? variantDataFromTheStore?.originalPrice
          : variant.price}
      </p>

      {isCurrentSalesSessionActive && (
        <p>
          <strong>Updated Price:</strong>
          {isProductInStore
            ? variantDataFromTheStore?.price
            : productsVariantsPrices[variant.id]?.price}
        </p>
      )}

      <p>
        <strong>inventoryPolicy:</strong>
        {variant.inventoryPolicy}
      </p>

      {variant.inventoryPolicy !== 'CONTINUE' && (
        <p>
          <strong>inventory Quantity:</strong>
          {variant.inventoryQuantity}
        </p>
      )}
    </li>
  );
}

export { VariantCard };
