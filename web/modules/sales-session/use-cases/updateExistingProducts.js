import dotenv from 'dotenv';
import shopify from '../../../shopify.js';
import getProducerProducts from './get-producer-products.js';
import { updateCurrentVariantInventory } from '../../../webhooks/updateCurrentVariantInventory.js';
import { throwError } from '../../../utils/index.js';
import {obtainValidAccessToken} from '../../authentication/getNewAccessToken.js'

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
  accessToken,
  shouldUpdateThePrice = false
}) => {
  const hubProduct = new shopify.api.rest.Product({
    session
  });

  hubProduct.id = hubProductId;
  hubProduct.status = 'active';

  await hubProduct.saveAndUpdate();

  for (const hubVariant of storedVariants) {
    await updateCurrentVariantInventory({
      producerProductData: producerLatestProductData,
      hubProductId,
      storedHubVariant: hubVariant,
      accessToken,
      shouldUpdateThePrice
    });
    await delayFun(500);
  }
};

const archiveProduct = async ({
  hubProductId,
  session
}) => {
  const hubProduct = new shopify.api.rest.Product({
    session
  });

  hubProduct.id = hubProductId;
  hubProduct.status = 'archived';

  await hubProduct.saveAndUpdate();
  await delayFun(500);
};

const updateExistingProductsUseCase = async ({
  userId,
  shouldUpdateThePrice = false
}) => {
  try {
    const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);

    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throwError(
        'Error from updateExistingProductsUseCase: Shopify Session not found'
      );
    }

    
    const accessToken = await obtainValidAccessToken(userId);
    const productsWithVariants = await getProducerProducts(accessToken);

    if (productsWithVariants.length === 0) {
      return;
    }

    for (const product of productsWithVariants) {
      const { hubProductId, producerProductData } = product;
      const storedVariants = product.variants;

      if (producerProductData) {
        await updateSingleProduct({
          hubProductId,
          session,
          storedVariants,
          producerLatestProductData: producerProductData,
          shouldUpdateThePrice,
          accessToken
        });
      } else {
        await archiveProduct({session, hubProductId});
      }
    }
  } catch (e) {
    throwError('Error from updateExistingProductsUseCase', e);
  }
};

export default updateExistingProductsUseCase;
