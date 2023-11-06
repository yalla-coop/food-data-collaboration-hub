import dotenv from 'dotenv';
import shopify from '../../../shopify.js';
import { updateCurrentVariantInventory } from '../../../webhooks/updateCurrentVariantInventory.js';

dotenv.config();

const MAX_REQUESTS_PER_SECOND = 2;

const delayFun = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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

export default updateSingleProduct;
