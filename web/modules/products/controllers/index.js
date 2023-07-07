import {Router} from 'express';
import convertResponseToGraphData from '../../../middleware/convertResponseToGraphData.js';
import getFDCProducts from './get-fdc-products.js';
import getShopifyProducts from './get-shopify-products.js';

const products = Router();

products.get('/fdc', getFDCProducts, convertResponseToGraphData);
products.get('/shopify', getShopifyProducts, convertResponseToGraphData);

export default products;
