import shopify from '../../shopify.js';
import dotenv from 'dotenv';
import getProducerProducts from '../../modules/sales-session/use-cases/get-producer-products.js';
import { updateCurrentVariantInventory } from '../../webhooks/updateCurrentVariantInventory.js';

dotenv.config();

const MAX_REQUESTS_PER_SECOND = 2;

const delayFun = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HUB_SHOP_NAME = process.env.HUB_SHOP_NAME;

const updateSingleProduct = async ({
  hubProductId,
  session,
  storedVariants,
  producerLatestProductData,
  isPartiallySoldCasesEnabled
}) => {
  const hubProduct = new shopify.api.rest.Product({
    session
  });

  hubProduct.id = hubProductId;
  await hubProduct.saveAndUpdate();

  for (let hubVariant of storedVariants) {
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
  }
};

const updateExistingProductsCronJob = async () => {
  try {
    const shopName = HUB_SHOP_NAME;

    const sessions = await shopify.config.sessionStorage.findSessionsByShop(
      shopName
    );

    const session = sessions[0];

    const selectActiveSalesSessionSql = `
    SELECT * FROM sales_sessions WHERE is_active = true LIMIT 1
    `;

    const { rows: activeSalesSessions } = await query(
      selectActiveSalesSessionSql
    );

    if (activeSalesSessions.length === 0) {
      return;
    }

    const isPartiallySoldCasesEnabled =
      activeSalesSessions?.[0]?.partiallySoldEnabled;

    const productsWithVariants = await getProducerProducts();

    if (productsWithVariants.length === 0) {
      return;
    }

    for (let product of productsWithVariants) {
      const hubProductId = product.hubProductId;
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
    }

    return;
  } catch (e) {
    console.error(e);
  }
};

export default updateExistingProductsCronJob;
