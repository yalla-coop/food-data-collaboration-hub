import { Connector, SuppliedProduct } from '@datafoodconsortium/connector';
import facets from './thesaurus/facets.json' assert { type: 'json' };
import measures from './thesaurus/measures.json' assert { type: 'json' };
import productTypes from './thesaurus/productTypes.json' assert { type: 'json' };

const connector = new Connector();

await Promise.all([
  connector.loadFacets(JSON.stringify(facets)),
  connector.loadMeasures(JSON.stringify(measures)),
  connector.loadProductTypes(JSON.stringify(productTypes))
]);

async function importSuppliedProducts(dfcProducts) {
  if (!dfcProducts.length) {
    return [];
  }

  try {
    return connector.import(dfcProducts);
  } catch (error) {
    throw {
      message: 'Error importing supplied products',
      error
    };
  }
}
async function getSingleSuppliedProduct(suppliedProduct) {
  try {
    const productType = await suppliedProduct.getProductType();

    return {
      semanticId: suppliedProduct.getSemanticId(),
      name: suppliedProduct.getName(),
      description: suppliedProduct.getDescription(),
      productType
    };
  } catch (error) {
    throw {
      message: 'Error fetching single supplied product',
      error
    };
  }
}
async function getSingleVariantSuppliedProduct(suppliedProduct) {
  try {
    const [quantity, catalogItems] = await Promise.all([
      suppliedProduct.getQuantity(),
      suppliedProduct.getCatalogItems()
    ]);

    const [quantityValue, quantityUnit] = await Promise.all([
      quantity.getQuantityValue(),
      quantity.getQuantityUnit()
    ]);

    const offer = await catalogItems[0].getOfferers();
    const price = await offer[0].getPrice();
    const [priceValue, priceUnit] = await Promise.all([
      price.getValue(),
      price.getUnit()
    ]);

    const variantSuppliedProduct = {
      semanticId: suppliedProduct.getSemanticId(),
      name: suppliedProduct.getName(),
      quantityDetails: {
        quantityValue,
        quantityUnit
      },
      priceDetails: {
        priceValue,
        priceUnit
      }
    };

    return variantSuppliedProduct;
  } catch (error) {
    throw {
      message: 'Error fetching variant supplied product',
      error
    };
  }
}

function getSuppliedProducts(dfcProductImports) {
  return Promise.all(
    dfcProductImports.map((suppliedProduct) => {
      try {
        if (suppliedProduct.getSemanticId().includes('/variant/')) {
          return getSingleVariantSuppliedProduct(suppliedProduct);
        } else {
          return getSingleSuppliedProduct(suppliedProduct);
        }
      } catch (error) {
        throw error;
      }
    })
  );
}

export { importSuppliedProducts, getSuppliedProducts, SuppliedProduct };
