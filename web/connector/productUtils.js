import {
  throwError
} from '../utils/index.js';

import { loadConnectorWithResources, PlannedTransformation } from './index.js';
import { loadProductTypes, loadQuantityUnits } from './mappings.js';

function extractId(dfcSemanticId) {
  return dfcSemanticId.substring(dfcSemanticId.lastIndexOf('/') + 1);
}

async function getSingleSuppliedProduct(suppliedProduct) {
  try {
    const productTypesObj = await loadProductTypes();
    const productType = await suppliedProduct.getProductType();
    const semanticId = suppliedProduct.getSemanticId();
    const images = suppliedProduct.getImages();

    const suppliedProductDetails = {
      id: extractId(semanticId),
      title: suppliedProduct.getName(),
      body_html: suppliedProduct.getDescription(),
      product_type: productTypesObj[productType],
    };

    if (images.length) {
      suppliedProductDetails.image = {
        src: images[0],
        alt: suppliedProduct.getName()
      };
    }

    return suppliedProductDetails;
  } catch (error) {
    throwError('Error fetching single supplied product', error);
  }
}

async function getSingleVariantSuppliedProduct(suppliedProduct) {
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

    const priceValue = price.getQuantityValue();
    const priceVatRate = price.getVatRate();
    const hasVat = priceVatRate && Number(priceVatRate) > 0;
    const images = suppliedProduct.getImages();

    const quantityUnitsObj = await loadQuantityUnits();

    const isContinueSelling = stockLimitation === -1;

    const variantSuppliedProduct = {
      id: extractId(semanticId),
      title: productName,
      price: priceValue,
      weight: quantityValue,
      weight_unit: quantityUnitsObj[quantityUnit],
      inventory_quantity: isContinueSelling ? 0 : stockLimitation,
      sku,
      taxable: hasVat,
      tracked: true,
      inventory_policy: isContinueSelling ? 'continue' : 'deny',
      // TODO check if these are needed and make these dynamic
      fulfillment_service: 'manual',
      inventory_management: 'shopify'
      // compare_at_price: '2.99',
      // old_inventory_quantity: -15,
      // requires_shipping: true
    };

    if (images.length) {
      variantSuppliedProduct.image = {
        src: images[0],
        alt: productName
      };
    }

    return variantSuppliedProduct;
  } catch (error) {
    throwError('Error fetching single variant supplied product', error);
  }
}

async function importSuppliedProducts(dfcProducts) {
  if (!dfcProducts.length) {
    return [];
  }
  try {
    const connector = await loadConnectorWithResources();

    const imports = await connector.import(dfcProducts);

    return imports;
  } catch (error) {
    throwError('Error importing supplied products', error);
  }
}

async function getSuppliedProductDetailsFromImports(dfcExportsArray) {

  const dfcImports = await importSuppliedProducts(dfcExportsArray);

  const dfcRetailWholesalePairs = dfcImports.filter(
    (item) => item instanceof PlannedTransformation
  );

  return await Promise.all(dfcRetailWholesalePairs.map(toShopifyProduct));
}

async function toShopifyProduct(retailWholesalePair) {
  const consumptionFlows = await retailWholesalePair.getPlannedConsumptionFlows();
  const productionFlows = await retailWholesalePair.getPlannedProductionFlows();

  if (consumptionFlows.length !== 1 || productionFlows.length !== 1) {
    console.error(`Error handling the following PlannedTransformation. Dont know how to handle case where production/consumption is not 1-1`, retailWholesalePair)
  }


  const wholesaleProduct = await productionFlows[0].getProducedProduct();
  const retailProduct = await consumptionFlows[0].getConsumedProduct();

  
  const retailShopifyProduct = await getSingleVariantSuppliedProduct(retailProduct);
  const wholesaleShopifyProduct = await getSingleVariantSuppliedProduct(wholesaleProduct);
  const itemsPerWholesaleVariant = await (await consumptionFlows[0].getQuantity().getQuantityValue());

  const parentShopifyProduct = await getSingleSuppliedProduct(retailProduct);
  parentShopifyProduct.variants = [retailShopifyProduct];
  parentShopifyProduct.images = retailShopifyProduct.image ? [createImageObject(retailShopifyProduct.image, retailShopifyProduct.id, 1)] : [];
  
  return {
    parentProduct: parentShopifyProduct,
    retailProduct: retailShopifyProduct,
    wholesaleProduct: wholesaleShopifyProduct,
    itemsPerWholesaleVariant
  };
}

function createImageObject(image, productId, position, variantIds = []) {
  return {
    id: image.id,
    alt: image.alt,
    position,
    product_id: productId,
    admin_graphql_api_id: `gid://shopify/ProductImage/${image.id}`,
    src: image.src,
    variant_ids: variantIds
  };
}

async function generateShopifyFDCProducts(products) {
  try {
    return await getSuppliedProductDetailsFromImports(products);
  } catch (error) {
    throwError('Error generating Shopify FDC products', error);
  }
}

export { generateShopifyFDCProducts };
