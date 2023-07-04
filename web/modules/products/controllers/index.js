import {Router} from 'express';
import convertResponseToGraphData from '../../../middleware/convertResponseToGraphData.js';
import getProducts from './get-products.js';

const products = Router();

products.get('/', getProducts, convertResponseToGraphData);

export default products;
