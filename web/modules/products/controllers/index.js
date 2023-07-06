import {Router} from 'express';
import convertResponseToGraphData from '../../../middleware/convertResponseToGraphData.js';
import getFDCProducts from './get-fdc-products.js';
import getShopifyProducts from './get-shopify-products.js';

const products = Router();

products.get('/fdc-products', getFDCProducts, convertResponseToGraphData);
products.get('/shopify-products', getShopifyProducts, convertResponseToGraphData);

export default products;
