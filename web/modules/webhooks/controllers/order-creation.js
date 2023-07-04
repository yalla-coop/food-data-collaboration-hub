import fs from 'fs'
import WebhooksUseCases from '../use-cases/index.js'
import OrderUseCases from '../../orders/use-cases/index.js'

const orderCreation = async (req, res, next) => {
  console.log('orderCreation----------------------------------')

  try {
    //WebhooksUseCases.orderCreation({body: req.body, shopifyWebhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET})
    let order = OrderUseCases.createOrder({body: req.body, shopifyWebhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET})
  } catch (e) {
    console.warn('Error in order creation', e)
    res.sendStatus(500)
  }

  res.sendStatus(200)
};

export default orderCreation
