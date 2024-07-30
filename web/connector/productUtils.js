import { getTargetStringFromSemanticId, throwError } from '../utils/index.js';

import { loadConnectorWithResources } from './index.js';
import { loadProductTypes, loadQuantityUnits } from './mappings.js';

async function getSingleSuppliedProduct(suppliedProduct) {
  try {
    const productTypesObj = await loadProductTypes();
    const productType = await suppliedProduct.getProductType();
    const semanticId = suppliedProduct.getSemanticId();

    const images = suppliedProduct.getImages();

    const suppliedProductDetails = {
      id: getTargetStringFromSemanticId(semanticId, 'SuppliedProducts'),
      title: suppliedProduct.getName(),
      descriptionHtml: suppliedProduct.getDescription(),
      productType: productTypesObj[productType]
    };

    if (images.length) {
      suppliedProductDetails.image = {
        src: images[0],
        altText: suppliedProduct.getName()
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
      id: getTargetStringFromSemanticId(semanticId, 'SuppliedProducts'),
      title: productName,
      price: priceValue,
      weight: quantityValue,
      weightUnit: quantityUnitsObj[quantityUnit],
      inventoryQuantity: isContinueSelling ? 0 : stockLimitation,
      sku,
      taxable: hasVat,
      tracked: true,
      inventoryPolicy: isContinueSelling ? 'continue' : 'deny'
    };

    if (images.length) {
      variantSuppliedProduct.image = {
        src: images[0],
        altText: productName
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
    (item) => item.getSemanticType() === 'dfc-b:AsPlannedTransformation'
  );

  return await Promise.all(dfcRetailWholesalePairs.map(toShopifyProduct));
}

async function toShopifyProduct(retailWholesalePair) {
  const consumptionFlows =
    await retailWholesalePair.getPlannedConsumptionFlows();
  const productionFlows = await retailWholesalePair.getPlannedProductionFlows();

  if (consumptionFlows.length !== 1 || productionFlows.length !== 1) {
    console.error(
      `Error handling the following PlannedTransformation. Dont know how to handle case where production/consumption is not 1-1`,
      retailWholesalePair
    );
  }

  const wholesaleProduct = await productionFlows[0].getProducedProduct();
  const retailProduct = await consumptionFlows[0].getConsumedProduct();

  const retailShopifyProduct =
    await getSingleVariantSuppliedProduct(retailProduct);
  const wholesaleShopifyProduct =
    await getSingleVariantSuppliedProduct(wholesaleProduct);
  const itemsPerWholesaleVariant = await await consumptionFlows[0]
    .getQuantity()
    .getQuantityValue();

  const parentShopifyProduct = await getSingleSuppliedProduct(retailProduct);
  parentShopifyProduct.variants = [retailShopifyProduct];

  parentShopifyProduct.images = retailShopifyProduct.image
    ? [
        createImageObject(
          retailShopifyProduct.image,
          retailShopifyProduct.id,
          1
        )
      ]
    : [];

  return {
    parentProduct: parentShopifyProduct,
    retailProduct: retailShopifyProduct,
    wholesaleProduct: wholesaleShopifyProduct,
    itemsPerWholesaleVariant
  };
}

function createImageObject(image, productId, position, variantIds = []) {
  return {
    altText: image.altText,
    position,
    product_id: productId,
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
