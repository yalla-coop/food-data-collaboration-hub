import shopify from '../shopify.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { convertShopifyGraphQLIdToNumber } from '../utils/index.js';
dotenv.config();

const PRODUCER_SHOP_URL = process.env.PRODUCER_SHOP_URL;
const PRODUCER_SHOP = process.env.PRODUCER_SHOP;

const HUB_SHOP_NAME = process.env.HUB_SHOP_NAME;

const getLatestProducerProductData = async (producerProductId) => {
  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products/all?shop=${PRODUCER_SHOP}`,
      {
        ids: `${producerProductId}`
      }
    );

    const { products: producerProducts } = data;

    const producerProductData = producerProducts[0];
    return producerProductData;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const updateCurrentVariantInventory = async ({
  hubProductId,
  producerProductId,
  producerProductData,
  hubVariantId,
  noOfItemsPerPackage,
  mappedProducerVariantId,
  numberOfExcessOrders
}) => {
  try {
    const sessions = await shopify.config.sessionStorage.findSessionsByShop(
      HUB_SHOP_NAME
    );

    const session = sessions[0];

    let producerProduct;

    if (!producerProductData) {
      producerProduct = await getLatestProducerProductData(producerProductId);
    } else {
      producerProduct = producerProductData;
    }

    const mappedProducerVariant = producerProduct.variants.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        convertShopifyGraphQLIdToNumber(mappedProducerVariantId)
    );

    const hubProductVariants = await shopify.api.rest.Variant.all({
      session,
      product_id: hubProductId
    });

    const currentVariant = hubProductVariants.find(
      (v) => Number(v.id) === Number(hubVariantId)
    );

    if (!currentVariant) {
      throw new Error('Variant not found');
    }

    const inventoryItemId = currentVariant.inventory_item_id;

    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session,
      inventory_item_ids: inventoryItemId
    });

    const inventoryLevel = new shopify.api.rest.InventoryLevel({
      session
    });

    const availableItemsInTheStore =
      noOfItemsPerPackage * Number(mappedProducerVariant.inventory_quantity) +
      Number(numberOfExcessOrders);

    await inventoryLevel.set({
      inventory_item_id: inventoryItemId,
      available: !!availableItemsInTheStore ? availableItemsInTheStore : 0,
      location_id: inventoryLevels.find(
        (l) => l.inventory_item_id === inventoryItemId
      ).location_id
    });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
