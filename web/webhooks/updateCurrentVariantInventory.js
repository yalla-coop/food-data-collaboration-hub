import axios from 'axios';
import dotenv from 'dotenv';
import shopify from '../shopify.js';
import { query } from '../database/connect.js';
import { executeGraphQLQuery, throwError } from '../utils/index.js';
import { generateShopifyFDCProducts } from '../connector/productUtils.js';

dotenv.config();
const { PRODUCER_SHOP_URL, PRODUCER_SHOP, HUB_SHOP_NAME } = process.env;

const UPDATE_VARIANT_PRICE_MUTATION = `
  mutation updateVariantPrice($id: ID!, $price: String!) {
    variantUpdate(input: { id: $id, price: $price }) {
      variant {
        id
        price
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_INVENTORY_MUTATION = `
  mutation updateInventory($inventoryItemId: ID!, $available: Int!, $locationId: ID!) {
    inventoryAdjustQuantity(input: {
      inventoryItemId: $inventoryItemId,
      availableDelta: $available,
      locationId: $locationId
    }) {
      inventoryLevel {
        id
        available
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_VARIANT_DETAILS_MUTATION = `
  mutation updateVariantDetails($id: ID!, $inventoryPolicy: String, $inventoryManagement: String) {
    variantUpdate(input: {
      id: $id,
      inventoryPolicy: $inventoryPolicy,
      inventoryManagement: $inventoryManagement
    }) {
      variant {
        id
        inventoryPolicy
        inventoryManagement
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_LOCATION_QUERY = `
  query {
    locations(first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const updateVariantDBQuery =
  'UPDATE variants SET price = $1 WHERE hub_variant_id = $2';

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

const getLatestProducerProductData = async (producerProductId, accessToken) => {
  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products/all?shop=${PRODUCER_SHOP}`,
      {
        ids: `${producerProductId}`
      },
      {
        headers: {
          Authorization: `JWT ${accessToken}`
        }
      }
    );

    const producerProducts = await generateShopifyFDCProducts(data.products);

    const producerProductData = producerProducts[0];
    return producerProductData;
  } catch (err) {
    throwError('Error from getLatestProducerProductData', err);
  }
};

const updateCurrentVariantPriceDB = async ({
  hubVariantId,
  hubVariantNewPrice
}) => {
  try {
    const result = await query(updateVariantDBQuery, [
      hubVariantNewPrice,
      hubVariantId
    ]);
    return result.rows[0];
  } catch (err) {
    throwError('Error from updateCurrentVariantPrice db query', err);
  }
};

const updateCurrentVariantPrice = async ({
  hubVariantId,
  storedHubVariant,
  mappedVariantPrice,
  gqlClient
}) => {
  try {
    const hubVariantNewPrice = calculateThePrice({
      originalPrice: mappedVariantPrice,
      _addingPriceType: storedHubVariant.addedValueMethod,
      markUpValue: storedHubVariant.addedValue,
      noOfItemsPerPackage: storedHubVariant.noOfItemsPerPackage
    }).toFixed(2);

    const variables = {
      id: `gid://shopify/ProductVariant/${hubVariantId}`,
      price: hubVariantNewPrice
    };

    const mutationResponse = await executeGraphQLQuery({
      gqlClient,
      QUERY: UPDATE_VARIANT_PRICE_MUTATION,
      variables
    });
    if (mutationResponse.variantUpdate.userErrors.length > 0) {
      throw new Error(
        JSON.stringify(mutationResponse.variantUpdate.userErrors)
      );
    }

    return await updateCurrentVariantPriceDB({
      hubVariantId,
      hubVariantNewPrice
    });
  } catch (err) {
    throwError('Error from updateCurrentVariantPrice', err);
  }
};

const getWholesaleProducerProduct = async ({
  producerProductId,
  producerProductData,
  mappedVariantId,
  hubVariantId,
  accessToken
}) => {
  let wholesaleProducerProduct;

  if (!producerProductData) {
    wholesaleProducerProduct = (
      await getLatestProducerProductData(producerProductId, accessToken)
    )?.wholesaleProduct;
  } else {
    wholesaleProducerProduct = producerProductData.wholesaleProduct;
  }

  if (!wholesaleProducerProduct) {
    console.error(
      `Unable to load latest producer data for ${producerProductId}`
    );
    return null;
  }

  if (Number(wholesaleProducerProduct.id) !== Number(mappedVariantId)) {
    console.error(
      `Couldn't update the inventory for hub product ${hubVariantId}. The mapped wholesale variant was different, ${mappedVariantId} in hub, ${wholesaleProducerProduct.id} from producer`
    );
    return null;
  }

  return wholesaleProducerProduct;
};

export const updateCurrentVariantInventory = async ({
  producerProductId,
  producerProductData,
  shouldUpdateThePrice = false,
  storedHubVariant,
  accessToken
}) => {
  try {
    const {
      hubVariantId,
      noOfItemsPerPackage,
      mappedVariantId,
      numberOfExcessOrders
    } = storedHubVariant;
    const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);
    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throwError(
        'Error from updateCurrentVariantInventory: Shopify Session not found'
      );
    }
    const gqlClient = new shopify.api.clients.Graphql({ session });

    const wholesaleProducerProduct = await getWholesaleProducerProduct({
      producerProductId,
      producerProductData,
      mappedVariantId,
      hubVariantId,
      accessToken
    });

    if (shouldUpdateThePrice) {
      await updateCurrentVariantPrice({
        hubVariantId,
        session,
        storedHubVariant,
        mappedVariantPrice: wholesaleProducerProduct.price,
        gqlClient
      });
    }

    const variablesForVariantUpdate = {
      id: `gid://shopify/ProductVariant/${hubVariantId}`,
      inventoryPolicy: wholesaleProducerProduct.inventoryPolicy,
      inventoryManagement:
        wholesaleProducerProduct.inventoryManagement || 'shopify'
    };

    const locationQueryResponse = await executeGraphQLQuery({
      gqlClient,
      QUERY: GET_LOCATION_QUERY
    });
    const locationId = locationQueryResponse.locations.edges[0].node.id;

    const variantUpdatesMutationResponse = await executeGraphQLQuery({
      gqlClient,
      QUERY: UPDATE_VARIANT_DETAILS_MUTATION,
      variables: variablesForVariantUpdate
    });

    if (variantUpdatesMutationResponse.variantUpdate.userErrors.length > 0) {
      throw new Error(
        JSON.stringify(variantUpdatesMutationResponse.variantUpdate.userErrors)
      );
    }

    const inventoryItemId = `gid://shopify/InventoryItem/${hubVariantId}`;

    const availableItemsInTheStore =
      noOfItemsPerPackage * Number(wholesaleProducerProduct.inventoryQuantity) +
      Number(numberOfExcessOrders);

    const variablesForInventoryUpdate = {
      inventoryItemId,
      available: availableItemsInTheStore || 0,
      locationId
    };

    const inventoryMutationResponse = await executeGraphQLQuery({
      gqlClient,
      QUERY: UPDATE_INVENTORY_MUTATION,
      variables: variablesForInventoryUpdate
    });

    if (
      inventoryMutationResponse.inventoryAdjustQuantity.userErrors.length > 0
    ) {
      throw new Error(
        JSON.stringify(
          inventoryMutationResponse.inventoryAdjustQuantity.userErrors
        )
      );
    }
  } catch (err) {
    throwError('Error updating current variant inventory', err);
  }
};
