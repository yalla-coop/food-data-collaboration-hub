import {Router} from 'express';
import convertResponseToGraphData from '../../../middleware/convertResponseToGraphData.js';
import getFDCProducts from './get-fdc-products.js';
import getShopifyProducts from './get-shopify-products.js';
import createShopifyProduct from './create-shopify-product.js';
import deleteShopifyProduct from './delete-shopify-product.js';

const products = Router();

products.get('/fdc', getFDCProducts, convertResponseToGraphData);
products.get('/shopify', getShopifyProducts, convertResponseToGraphData);
products.post('/shopify', createShopifyProduct);
products.delete('/shopify', deleteShopifyProduct);

export default products;
