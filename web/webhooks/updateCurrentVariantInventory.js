import axios from 'axios';
import dotenv from 'dotenv';
import shopify from '../shopify.js';
import { query } from '../database/connect.js';
import { convertShopifyGraphQLIdToNumber } from '../utils/index.js';

dotenv.config();
const { PRODUCER_SHOP_URL, PRODUCER_SHOP, HUB_SHOP_NAME } = process.env;

export const calculateThePrice = ({
  originalPrice,
  _addingPriceType,
  markUpValue = 0,
  noOfItemsPerPackage
}) => {
  if (!originalPrice || !_addingPriceType || !noOfItemsPerPackage) return 0;

  const itemPrice = Number(originalPrice) / Number(noOfItemsPerPackage);

  if (noOfItemsPerPackage === 0) return 0;

  if (!markUpValue || markUpValue === 0) return itemPrice;

  const increasedPrice =
    _addingPriceType === 'fixed'
      ? Number(markUpValue) + itemPrice
      : itemPrice + (itemPrice * Number(markUpValue)) / 100;

  return increasedPrice;
};

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

const updateCurrentVariantPrice = async ({
  hubVariantId,
  session,
  storedHubVariant,
  mappedVariantPrice
}) => {
  try {
    const hubVariantNewPrice = calculateThePrice({
      originalPrice: mappedVariantPrice,
      _addingPriceType: storedHubVariant.addedValueMethod,
      markUpValue: storedHubVariant.addedValue,
      noOfItemsPerPackage: storedHubVariant.noOfItemsPerPackage
    });

    const exitingVariant = new shopify.api.rest.Variant({
      session
    });
    exitingVariant.id = hubVariantId;
    exitingVariant.price = hubVariantNewPrice.toFixed(2);
    // we should update also the existing price of this variant
    await exitingVariant.saveAndUpdate();
    const updateVariantQuery =
      'UPDATE variants SET price = $1 WHERE hub_variant_id = $2';

    try {
      await query(updateVariantQuery, [hubVariantNewPrice, hubVariantId]);
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const updateCurrentVariantInventory = async ({
  producerProductId,
  producerProductData,
  isPartiallySoldCasesEnabled,
  shouldUpdateThePrice = false,
  storedHubVariant
}) => {
  try {
    const {
      hubVariantId,
      noOfItemsPerPackage,
      mappedVariantId,
      numberOfExcessOrders,
      numberOfRemainingOrders
    } = storedHubVariant;

    const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);

    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw new Error('Shopify Session not found');
    }

    let producerProduct;

    if (!producerProductData) {
      producerProduct = await getLatestProducerProductData(producerProductId);
    } else {
      producerProduct = producerProductData;
    }

    const mappedProducerVariant = producerProduct.variants.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        convertShopifyGraphQLIdToNumber(mappedVariantId)
    );

    if (shouldUpdateThePrice) {
      await updateCurrentVariantPrice({
        hubVariantId,
        session,
        storedHubVariant,
        mappedVariantPrice: mappedProducerVariant.price
      });
    }

    const currentHubVariant = new shopify.api.rest.Variant({
      session
    });

    currentHubVariant.id = hubVariantId;

    currentHubVariant.inventory_policy = mappedProducerVariant.inventory_policy;

    await currentHubVariant.saveAndUpdate();

    const inventoryItemId = currentHubVariant.inventory_item_id;

    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session,
      inventory_item_ids: inventoryItemId
    });

    const inventoryLevel = new shopify.api.rest.InventoryLevel({
      session
    });

    let availableItemsInTheStore = 0;

    if (isPartiallySoldCasesEnabled) {
      availableItemsInTheStore =
        noOfItemsPerPackage * Number(mappedProducerVariant.inventory_quantity) +
        Number(numberOfExcessOrders);
    } else {
      availableItemsInTheStore = Math.abs(
        noOfItemsPerPackage * Number(mappedProducerVariant.inventory_quantity) -
          Number(numberOfRemainingOrders)
      );
    }

    await inventoryLevel.set({
      inventory_item_id: inventoryItemId,
      available: availableItemsInTheStore || 0,
      location_id: inventoryLevels.find(
        (l) => l.inventory_item_id === inventoryItemId
      ).location_id
    });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
