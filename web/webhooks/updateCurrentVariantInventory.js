import axios from 'axios';
import dotenv from 'dotenv';
import shopify from '../shopify.js';
import { query } from '../database/connect.js';
import { convertShopifyGraphQLIdToNumber, throwError } from '../utils/index.js';
import { generateShopifyFDCProducts } from '../connector/productUtils.js';

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

    const producerProducts = await generateShopifyFDCProducts(data.products);

    const producerProductData = producerProducts[0];
    return producerProductData;
  } catch (err) {
    throwError('Error from getLatestProducerProductData', err);
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

    const existingVariant = new shopify.api.rest.Variant({
      session
    });
    existingVariant.id = hubVariantId;
    existingVariant.price = hubVariantNewPrice.toFixed(2);
    // we should update also the existing price of this variant
    await existingVariant.saveAndUpdate();
    const updateVariantQuery =
      'UPDATE variants SET price = $1 WHERE hub_variant_id = $2';

    try {
      await query(updateVariantQuery, [hubVariantNewPrice, hubVariantId]);
    } catch (err) {
      throwError('Error from updateCurrentVariantPrice db query', err);
    }
  } catch (err) {
    throwError('Error from updateCurrentVariantPrice', err);
  }
};

export const updateCurrentVariantInventory = async ({
  producerProductId,
  producerProductData,
  shouldUpdateThePrice = false,
  storedHubVariant
}) => {
  try {
    const {
      hubVariantId,
      noOfItemsPerPackage,
      mappedVariantId,
      numberOfExcessOrders,
    } = storedHubVariant;
    const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);

    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throwError(
        'Error from updateCurrentVariantInventory: Shopify Session not found'
      );
    }

    let wholesaleProducerProduct;

    if (!producerProductData) {
      wholesaleProducerProduct = (await getLatestProducerProductData(producerProductId))?.wholesaleProduct;
    } else {
      wholesaleProducerProduct = producerProductData.wholesaleProduct;
    }

    if (!wholesaleProducerProduct) {
      console.error(`Unable to load latest producer data for ${producerProductId}`);
      return;
    }

    if (Number(wholesaleProducerProduct.id) !== Number(mappedVariantId)) {
      console.error(`Couldn't update the inventory for hub product ${hubVariantId}. The mapped wholesale variant was different, ${mappedVariantId} in hub, ${wholesaleProducerProduct.id} from producer`);
      return;
    }


    if (shouldUpdateThePrice) {
      await updateCurrentVariantPrice({
        hubVariantId,
        session,
        storedHubVariant,
        mappedVariantPrice: wholesaleProducerProduct.price
      });
    }
    const currentHubVariant = new shopify.api.rest.Variant({
      session
    });

    currentHubVariant.id = hubVariantId;

    currentHubVariant.inventory_policy = wholesaleProducerProduct.inventory_policy;
    currentHubVariant.inventory_management = wholesaleProducerProduct.inventory_management || 'shopify';
    await currentHubVariant.saveAndUpdate();

    const inventoryItemId = currentHubVariant.inventory_item_id;

    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session,
      inventory_item_ids: inventoryItemId
    });

    const inventoryLevel = new shopify.api.rest.InventoryLevel({
      session
    });

    const availableItemsInTheStore =
      noOfItemsPerPackage * Number(wholesaleProducerProduct.inventory_quantity) +
      Number(numberOfExcessOrders);

    await inventoryLevel.set({
      inventory_item_id: inventoryItemId,
      available: availableItemsInTheStore || 0,
      location_id: inventoryLevels.find(
        (l) => l.inventory_item_id === inventoryItemId
      ).location_id
    });
  } catch (err) {
    throwError('Error updating current variant inventory', err);
  }
};
