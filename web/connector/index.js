import { Connector } from '@datafoodconsortium/connector';
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

  return await connector.import(dfcProducts);
}

async function getSuppliedProducts(dfcProductImports) {
  return Promise.all(
    dfcProductImports.map(async (suppliedProduct) => {
      const productType = await suppliedProduct.getProductType();

      return {
        semanticId: suppliedProduct.getSemanticId(),
        name: suppliedProduct.getName(),
        description: suppliedProduct.getDescription(),
        productType: productType
      };
    })
  );
}

export { importSuppliedProducts, getSuppliedProducts };
