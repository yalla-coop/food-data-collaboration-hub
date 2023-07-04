import {Router} from 'express';
import postOrder from './post-order.js';

const orders = Router();

orders.get('/', postOrder, convertResponseToGraphData);

export default orders;