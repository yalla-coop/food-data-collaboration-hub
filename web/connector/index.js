import {
  Connector
  // QuantitativeValue,
  // SuppliedProduct,
  // AllergenCharacteristic,
  // NutrientCharacteristic,
  // Person,
  // SaleSession,
  // OrderLine,
  // Order,
  // PhysicalCharacteristic
} from '@datafoodconsortium/connector';
import facets from './thesaurus/facets.json' assert { type: 'json' };
import measures from './thesaurus/measures.json' assert { type: 'json' };
import productTypes from './thesaurus/productTypes.json' assert { type: 'json' };

const connector = new Connector();

await Promise.all([
  connector.loadFacets(JSON.stringify(facets)),
  connector.loadMeasures(JSON.stringify(measures)),
  connector.loadProductTypes(JSON.stringify(productTypes))
]);

// function createSuppliedProduct(product) {
//   let {
//     id,
//     description,
//     descriptionHtml,
//     productType,
//     title,
//     totalInventory,
//     status,
//     handle,
//     metafields,
//     priceRange
//   } = product;

//   let suppliedProduct = new SuppliedProduct(title, description);

//   return suppliedProduct;
// }

export {
  Connector,
  connector
  // Person,
  // SaleSession,
  // OrderLine,
  // Order,
  // createSuppliedProduct
};
