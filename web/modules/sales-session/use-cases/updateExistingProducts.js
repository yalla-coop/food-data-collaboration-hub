import dotenv from 'dotenv';
import shopify from '../../../shopify.js';
import getProducerProducts from './get-producer-products.js';
import { updateCurrentVariantInventory } from '../../../webhooks/updateCurrentVariantInventory.js';

dotenv.config();

const MAX_REQUESTS_PER_SECOND = 2;

const delayFun = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const { HUB_SHOP_NAME } = process.env;

const updateSingleProduct = async ({
  hubProductId,
  session,
  storedVariants,
  producerLatestProductData,
  isPartiallySoldCasesEnabled,
  shouldUpdateThePrice = false
}) => {
  const hubProduct = new shopify.api.rest.Product({
    session
  });

  hubProduct.id = hubProductId;
  await hubProduct.saveAndUpdate();

  for (const hubVariant of storedVariants) {
    await updateCurrentVariantInventory({
      producerProductData: producerLatestProductData,
      hubProductId,
      storedHubVariant: hubVariant,
      isPartiallySoldCasesEnabled,
      shouldUpdateThePrice
    });
  };
};

const updateExistingProductsUseCase = async ({
  isPartiallySoldCasesEnabled,
  shouldUpdateThePrice = false
}) => {
  try {
    const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);

    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw new Error('Shopify Session not found');
    }

    const productsWithVariants = await getProducerProducts();

    if (productsWithVariants.length === 0) {
      return;
    }

    for (const product of productsWithVariants) {
      const { hubProductId } = product;
      const storedVariants = product.variants;
      await updateSingleProduct({
        hubProductId,
        session,
        storedVariants,
        producerVariants: product.updatedProductJsonData.variants,
        producerLatestProductData: product.updatedProductJsonData,
        isPartiallySoldCasesEnabled,
        shouldUpdateThePrice
      });
    };
  } catch (e) {
    console.log(e);
    throw new Error('Failed to update existing products', e);
  }
};

export default updateExistingProductsUseCase;
