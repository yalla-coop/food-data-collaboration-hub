import { throwError } from '../utils/index.js';

import { connector, SuppliedProduct } from './index.js';

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
    // const productType = await suppliedProduct.getProductType();
    const semanticId = suppliedProduct.getSemanticId();

    return {
      id: getTargetIdFromSemanticId(semanticId, 'product'),
      title: suppliedProduct.getName(),
      description: suppliedProduct.getDescription(),
      // TODO: make these dynamic
      product_type: 'BuckwheatFlour',
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

    const quantityValue = await quantity.getQuantityValue();

    const offer = await catalogItems[0].getOfferers();
    const price = await offer[0].getPrice();
    const priceValue = await price.getValue();

    const variantSuppliedProduct = {
      id: getTargetIdFromSemanticId(semanticId, 'variant'),
      product_id: getTargetIdFromSemanticId(semanticId, 'product'),
      inventory_item_id: getTargetIdFromSemanticId(semanticId, 'inventory'),
      title: productName,
      price: priceValue,
      option1: productName, // mirrors variant title
      weight: quantityValue,
      weight_unit: 'kg',
      position: count,
      // TODO make these dynamic
      sku: 'OFBL/R5',
      inventory_policy: 'deny',
      compare_at_price: '2.99',
      fulfillment_service: 'manual',
      inventory_management: 'shopify',
      taxable: false,
      inventory_quantity: -15,
      old_inventory_quantity: -15,
      requires_shipping: true
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
