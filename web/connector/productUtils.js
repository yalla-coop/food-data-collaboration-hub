import { throwError } from '../utils/index.js';

import { connector, SuppliedProduct } from './index.js';
import { productTypes, quantityUnits } from './mappings.js';

export function getTargetIdFromSemanticId(url, key) {
  const parts = url.split('/');
  const targetIdIndex = parts.indexOf(key) + 1;

  if (!targetIdIndex || targetIdIndex === 0) {
    throwError(`Could not find ${key} in ${url}`);
  }

  const targetId = parts[targetIdIndex];
  return targetId;
}

async function getSingleSuppliedProduct(suppliedProduct) {
  try {
    const productType = await suppliedProduct.getProductType();
    const semanticId = suppliedProduct.getSemanticId();

    return {
      id: getTargetIdFromSemanticId(semanticId, 'product'),
      title: suppliedProduct.getName(),
      description: suppliedProduct.getDescription(),
      product_type: productTypes[productType],
      // image: suppliedProduct.getImage(), TODO fix this
      // TODO: make these dynamic
      vendor: 'Hodmedod',
      tags: 'fdc',
      status: 'active'
    };
  } catch (error) {
    throwError('Error fetching single supplied product', error);
  }

  return null;
}

async function getSingleVariantSuppliedProduct(suppliedProduct, count) {
  try {
    const semanticId = suppliedProduct.getSemanticId();
    const productName = suppliedProduct.getName();
    const [quantity, catalogItems] = await Promise.all([
      suppliedProduct.getQuantity(),
      suppliedProduct.getCatalogItems()
    ]);

    const [quantityValue, quantityUnit] = await Promise.all([
      quantity.getQuantityValue(),
      quantity.getQuantityUnit()
    ]);

    const catalogItem = catalogItems[0];

    const sku = catalogItem.getSku();

    const stockLimitation = catalogItem.getStockLimitation();

    const offer = await catalogItem.getOfferers();
    const price = await offer[0].getPrice();
    const priceValue = price.getValue();
    const priceVatRate = price.getVatRate();
    const hasVat = priceVatRate && Number(priceVatRate) > 0;

    const variantSuppliedProduct = {
      id: getTargetIdFromSemanticId(semanticId, 'variant'),
      product_id: getTargetIdFromSemanticId(semanticId, 'product'),
      inventory_item_id: getTargetIdFromSemanticId(semanticId, 'inventory'),
      title: productName,
      price: priceValue,
      option1: productName, // mirrors variant title
      weight: quantityValue,
      weight_unit: quantityUnits[quantityUnit],
      position: count,
      inventory_quantity: stockLimitation,
      sku,
      taxable: hasVat
      // TODO check if these are needed and make these dynamic
      // inventory_policy: 'deny',
      // compare_at_price: '2.99',
      // fulfillment_service: 'manual',
      // inventory_management: 'shopify',
      // old_inventory_quantity: -15,
      // requires_shipping: true
    };

    return variantSuppliedProduct;
  } catch (error) {
    throwError('Error fetching single variant supplied product', error);
  }
  return null;
}

async function importSuppliedProducts(dfcProducts) {
  if (!dfcProducts.length) {
    return [];
  }

  try {
    return connector.import(dfcProducts);
  } catch (error) {
    throwError('Error importing supplied products', error);
  }

  return null;
}

async function getSuppliedProductDetailsFromImports(dfcExportsArray) {
  const dfcImports = await importSuppliedProducts(dfcExportsArray);
  if (!Array.isArray(dfcImports) || !dfcImports.length) {
    throwError('Error importing supplied products: no imports');
  }

  const dfcSuppliedProducts = dfcImports.filter(
    (importedProduct) => importedProduct instanceof SuppliedProduct
  );
  let count = 0;
  return Promise.all(
    dfcSuppliedProducts.map((suppliedProduct) => {
      try {
        if (suppliedProduct.getSemanticId().includes('/variant/')) {
          count++;
          return getSingleVariantSuppliedProduct(suppliedProduct, count);
        }
        return getSingleSuppliedProduct(suppliedProduct);
      } catch (error) {
        throwError(
          'Error getting supplied product details from imports',
          error
        );
      }
      return null;
    })
  );
}

const groupVariantsUnderProducts = (items) => {
  const productsMap = new Map();

  items.forEach((item) => {
    if (!item.product_id) {
      // It's a product, add it to the map with an empty variants array
      productsMap.set(item.id, { ...item, variants: [] });
    } else {
      // It's a variant, find the parent product and add this variant to its variants array
      const product = productsMap.get(item.product_id);
      if (product) {
        product.variants.push(item);
      } else {
        throwError(`Could not find product with id ${item.product_id}`);
      }
    }
  });

  return Array.from(productsMap.values());
};

async function generateShopifyFDCProducts(products) {
  try {
    const dfcProducts = await getSuppliedProductDetailsFromImports(products);
    return groupVariantsUnderProducts(dfcProducts);
  } catch (error) {
    throwError('Error generating Shopify FDC products', error);
  }

  return null;
}

export { generateShopifyFDCProducts };
