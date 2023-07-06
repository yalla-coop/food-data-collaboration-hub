import { connector } from '../../../connector/index.js';
import FDC from '../../../repositories/fdc/index.js';

const getFDCProducts = async (fdcAPIURL) => {

  const json = await FDC.getProducts(fdcAPIURL)
  const catalog = await connector.import(json)
  return catalog
}

export default getFDCProducts;