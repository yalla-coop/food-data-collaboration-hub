import shopify from '../../shopify.js';
import dotenv from 'dotenv';
import getProducerProducts from '../../modules/sales-session/use-cases/get-producer-products.js';

dotenv.config();

const MAX_REQUESTS_PER_SECOND = 2;

const delayFun = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HUB_SHOP_NAME = process.env.HUB_SHOP_NAME;
const variantUpdate = async ({
  session,
  storedVariants,
  hubVariants,
  producerVariant,
  inventoryLevels
}) => {
  const hubVariantId = storedVariants.find(
    (v) => Number(v.producerVariantId) === Number(producerVariant.id)
  ).hubVariantId;

  const inventoryItemId = hubVariants.find(
    (v) => Number(v.id) === Number(hubVariantId)
  ).inventory_item_id;

  const inventoryLevel = new shopify.api.rest.InventoryLevel({
    session
  });

  await inventoryLevel.set({
    inventory_item_id: inventoryItemId,
    available: producerVariant.inventory_quantity,
    location_id: inventoryLevels.find(
      (l) => l.inventory_item_id === inventoryItemId
    ).location_id
  });
};

const updateSingleProduct = async ({
  hubProductId,
  session,
  producerVariants,
  storedVariants
}) => {
  const hubProduct = new shopify.api.rest.Product({
    session
  });

  hubProduct.id = hubProductId;
  await hubProduct.saveAndUpdate();

  const hubVariants = await shopify.api.rest.Variant.all({
    session,
    product_id: hubProductId
  });

  const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
    session,
    inventory_item_ids: hubVariants.map((v) => v.inventory_item_id).join(',')
  });

  for (let producerVariant of producerVariants) {
    await variantUpdate({
      session,
      storedVariants,
      hubVariants,
      inventoryLevels,
      producerVariant
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
        producerVariants: product.updatedProductJsonData.variants
      });

      await delayFun(1000 / MAX_REQUESTS_PER_SECOND);
    }

    return;
  } catch (e) {
    console.error(e);
  }
};

export default updateExistingProductsCronJob;
