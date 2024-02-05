import {
  getQueryParamsObjFromUrl,
  getTargetStringFromSemanticId,
  throwError
} from '../utils/index.js';

import { loadConnectorWithResources, SuppliedProduct } from './index.js';
import { loadProductTypes, loadQuantityUnits } from './mappings.js';

async function getSingleSuppliedProduct(suppliedProduct) {
  try {
    const productTypesObj = await loadProductTypes();
    const productType = await suppliedProduct.getProductType();
    const semanticId = suppliedProduct.getSemanticId();
    const images = suppliedProduct.getImages();

    const queryParamsObject = getQueryParamsObjFromUrl(semanticId); // handle, imageId

    const suppliedProductDetails = {
      id: getTargetStringFromSemanticId(semanticId, 'product'),
      title: suppliedProduct.getName(),
      body_html: suppliedProduct.getDescription(),
      product_type: productTypesObj[productType],
      handle: queryParamsObject.handle
    };

    if (images.length && queryParamsObject.imageId) {
      suppliedProductDetails.image = {
        id: queryParamsObject.imageId,
        src: images[0],
        alt: suppliedProduct.getName()
      };
    }

    return suppliedProductDetails;
  } catch (error) {
    throwError('Error fetching single supplied product', error);
  }

  return null;
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
    const priceValue = price.getValue();
    const priceVatRate = price.getVatRate();
    const hasVat = priceVatRate && Number(priceVatRate) > 0;
    const images = suppliedProduct.getImages();

    const queryParamsObject = getQueryParamsObjFromUrl(semanticId);
    const quantityUnitsObj = await loadQuantityUnits();

    const variantSuppliedProduct = {
      id: getTargetStringFromSemanticId(semanticId, 'variant'),
      product_id: getTargetStringFromSemanticId(semanticId, 'product'),
      inventory_item_id: getTargetStringFromSemanticId(semanticId, 'inventory'),
      title: productName,
      price: priceValue,
      weight: quantityValue,
      weight_unit: quantityUnitsObj[quantityUnit],
      inventory_quantity: stockLimitation,
      sku,
      taxable: hasVat,
      tracked: queryParamsObject.tracked,
      // TODO check if these are needed and make these dynamic
      inventory_policy: 'deny',
      fulfillment_service: 'manual',
      inventory_management: 'shopify'
      // compare_at_price: '2.99',
      // old_inventory_quantity: -15,
      // requires_shipping: true
    };

    if (images.length && queryParamsObject.imageId) {
      variantSuppliedProduct.image = {
        id: queryParamsObject.imageId,
        src: images[0],
        alt: productName
      };
    }

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
    const connector = await loadConnectorWithResources();
    return connector.import(dfcProducts);
  } catch (error) {
    throwError('Error importing supplied products', error);
  }

  return null;
}

function sortDfcSuppliedProductsFirst(productsAndVariantsArray) {
  return productsAndVariantsArray.sort((a, b) => {
    const aHasVariant = a.getSemanticId().includes('/variant/');
    const bHasVariant = b.getSemanticId().includes('/variant/');

    if (aHasVariant && !bHasVariant) {
      return 1;
    }
    if (!aHasVariant && bHasVariant) {
      return -1;
    }
    return 0;
  });
}

async function getSuppliedProductDetailsFromImports(dfcExportsArray) {
  const dfcImports = await importSuppliedProducts(dfcExportsArray);
  if (!Array.isArray(dfcImports) || !dfcImports.length) {
    throwError('Error importing supplied products: no imports');
  }

  const dfcSuppliedProducts = dfcImports.filter(
    (importedProduct) => importedProduct instanceof SuppliedProduct
  );

  return Promise.all(
    sortDfcSuppliedProductsFirst(dfcSuppliedProducts).map((suppliedProduct) => {
      try {
        if (suppliedProduct.getSemanticId().includes('/variant/')) {
          return getSingleVariantSuppliedProduct(suppliedProduct);
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

function addImagesToProducts(products) {
  const productsWithImages = products.map((product) => {
    const imagesArray = [];

    // add main product image
    if (product?.image) {
      imagesArray.push(createImageObject(product.image, product.id, 1));
    }

    // Adding images from variants
    product.variants.forEach((variant) => {
      if (variant?.image) {
        imagesArray.push(
          createImageObject(variant.image, product.id, imagesArray.length + 1, [
            variant.id
          ])
        );
      }
    });

    return { ...product, images: imagesArray };
  });

  return productsWithImages;
}

async function generateShopifyFDCProducts(products) {
  try {
    const dfcProducts = await getSuppliedProductDetailsFromImports(products);
    return addImagesToProducts(groupVariantsUnderProducts(dfcProducts));
  } catch (error) {
    throwError('Error generating Shopify FDC products', error);
  }

  return null;
}

export { generateShopifyFDCProducts };
