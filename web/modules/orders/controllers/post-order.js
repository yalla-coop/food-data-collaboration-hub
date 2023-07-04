import { OrderUseCases } from '../use-cases';

const postOrder = async (req, res) => {
  console.log('postOrder----------------------------------');
  
  const session = res.locals.shopify.session;
  const body = req.body;
  
  try {
    const order = await OrderUseCases.createOrder({session, body});
  } catch (e) {
    console.warn('Error in order creation', e);
    res.sendStatus(500);
  }
  
  res.locals.order = order;
  
  res.sendStatus(200);
}