import { 
  Address,
  Connector, 
  QuantitativeValue, 
  SuppliedProduct, 
  AllergenCharacteristic,
  NutrientCharacteristic,
  Person,
  SaleSession,
  OrderLine,
  Order,
  PhysicalCharacteristic
//} from "../dependencies/connector-typescript/lib/index.js"
} from "@datafoodconsortium/connector"
//import facets from "./thesaurus/facets.json" assert { type: 'json' }
//import measures from './thesaurus/measures.json' assert { type: 'json' }
//import productTypes from './thesaurus/productTypes.json' assert { type: 'json' }
import facets from './thesaurus/facets.js'
import measures from './thesaurus/measures.js'
import productTypes from './thesaurus/productTypes.js'

const connector = new Connector()

connector.loadFacets(JSON.stringify(JSON.parse(facets)))
connector.loadMeasures(JSON.stringify(JSON.parse(measures)))
connector.loadProductTypes(JSON.stringify(JSON.parse(productTypes)))

function createSuppliedProduct(product) {

  let {
      id,
      description,
      descriptionHtml,
      productType,
      title,
      totalInventory,
      status,
      handle,
      metafields,
      priceRange
    } = product

  let suppliedProduct = new SuppliedProduct(title, description);

  return suppliedProduct
}

export { Address, Connector, connector, Person, SaleSession, OrderLine, Order, createSuppliedProduct }