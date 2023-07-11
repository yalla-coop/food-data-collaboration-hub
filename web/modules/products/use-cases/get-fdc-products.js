import { connector } from '../../../connector/index.js';
import FDC from '../../../repositories/fdc/index.js';
import { config } from '../../../config.js';

const getFDCProducts = async () => {

  const json = await FDC.getProducts(config.FDC_API_URL)
  const catalog = await connector.import(json)
  console.log('getFDCProducts catalog', catalog)
  const products = await catalog[0].getItems()
  console.log('getFDCProducts products', products)
  return catalog
}

export default getFDCProducts;