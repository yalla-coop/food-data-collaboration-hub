import { Router } from 'express';
import getFDCProducts from './get-fdc-products.js';
import createShopifyProduct from './create-shopify-product.js';
import getShopifyProductById from './get-shopify-product-by-id.js';
import getProducts from './get-products.js';

const products = Router();

products.get('/fdc', getFDCProducts);
products.get('/shopify/:id', getShopifyProductById);
products.get('/', getProducts);
products.post('/shopify', createShopifyProduct);

export default products;
