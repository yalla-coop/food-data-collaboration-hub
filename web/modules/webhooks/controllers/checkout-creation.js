import fs from 'fs'
import WebhooksUseCases from '../use-cases/index.js'

const checkoutCreation = async (req, res, next) => {
  console.log('checkoutCreation----------------------------------')

  try {
    WebhooksUseCases.checkoutCreation({body: req.body, shopifyWebhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET})
  } catch (e) {
    console.warn('checkoutCreation error', e)
    res.sendStatus(500)
  }

  res.sendStatus(200)
};

export default checkoutCreation
