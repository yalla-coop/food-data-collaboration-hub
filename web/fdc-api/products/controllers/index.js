import {Router} from 'express';
import postProducts from './post-products.js';

const products = Router();

products.post('/', postProducts);

export default products;
