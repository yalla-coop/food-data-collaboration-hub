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
  isPartiallySoldCasesEnabled
}) => {
  console.log('update Single Product');
  const hubProduct = new shopify.api.rest.Product({
    session
  });

  hubProduct.id = hubProductId;
  await hubProduct.saveAndUpdate();

  storedVariants.forEach(async (hubVariant) => {
    await updateCurrentVariantInventory({
      producerProductData: producerLatestProductData,
      hubProductId,
      hubVariantId: hubVariant.hubVariantId,
      noOfItemsPerPackage: hubVariant.noOfItemsPerPackage,
      mappedProducerVariantId: hubVariant.mappedVariantId,
      numberOfExcessOrders: hubVariant.numberOfExcessOrders,
      numberOfRemainingOrders: hubVariant.numberOfRemainingOrders,
      isPartiallySoldCasesEnabled
    });
    await delayFun(1000 / MAX_REQUESTS_PER_SECOND);
  });
};

const updateExistingProductsUseCase = async ({
  isPartiallySoldCasesEnabled
}) => {
  try {
    const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);

    const session = shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw new Error('Shopify Session not found');
    }

    const productsWithVariants = await getProducerProducts();

    console.log('productsWithVariants', productsWithVariants);
    if (productsWithVariants.length === 0) {
      return;
    }

    productsWithVariants.forEach(async (product) => {
      console.log('updateExistingProductsUseCase');
      const { hubProductId } = product;
      const storedVariants = product.variants;
      await updateSingleProduct({
        hubProductId,
        session,
        storedVariants,
        producerVariants: product.updatedProductJsonData.variants,
        producerLatestProductData: product.updatedProductJsonData,
        isPartiallySoldCasesEnabled
      });

      await delayFun(1000 / MAX_REQUESTS_PER_SECOND);
    });
  } catch (e) {
    console.log(e);
    throw new Error('Failed to update existing products', e);
  }
};

export default updateExistingProductsUseCase;
