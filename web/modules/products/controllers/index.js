import { Router } from 'express';
import convertResponseToGraphData from '../../../middleware/convertResponseToGraphData.js';
import getFDCProducts from './get-fdc-products.js';
import getShopifyProducts from './get-shopify-products.js';
import createShopifyProduct from './create-shopify-product.js';
import deleteShopifyProduct from './delete-shopify-product.js';
import getShopifyProductById from './get-shopify-product-by-id.js';
import getProducts from './get-products.js';

const products = Router();

products.get('/fdc', getFDCProducts);
products.get('/shopify', getShopifyProducts, convertResponseToGraphData);
products.get('/shopify/:id', getShopifyProductById);
products.get('/', getProducts);
products.post('/shopify', createShopifyProduct);
products.delete('/shopify', deleteShopifyProduct);

export default products;
