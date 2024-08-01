import dotenv from 'dotenv';
import shopify from '../../../shopify.js';
import getProducerProducts from './get-producer-products.js';
import { updateCurrentVariantInventory } from '../../../webhooks/updateCurrentVariantInventory.js';
import { executeGraphQLQuery, throwError } from '../../../utils/index.js';
import { obtainValidAccessToken } from '../../authentication/getNewAccessToken.js';

dotenv.config();

const { HUB_SHOP_NAME } = process.env;

const updateProductStatusMutation = `
mutation UpdateProductStatus($input: ProductInput!) {
  productUpdate(input: $input) {
    product {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}`;

const updateSingleProduct = async ({
  gqlClient,
  hubProductId,
  storedVariants,
  producerLatestProductData,
  accessToken,
  shouldUpdateThePrice = false
}) => {
  const productVariables = {
    input: {
      id: `gid://shopify/Product/${hubProductId}`,
      status: 'ACTIVE'
    }
  };

  const productUpdateData = await executeGraphQLQuery({
    gqlClient,
    QUERY: updateProductStatusMutation,
    variables: productVariables
  });

  if (productUpdateData.productUpdate.userErrors.length > 0) {
    throw new Error(productUpdateData.productUpdate.userErrors[0].message);
  }

  for (const hubVariant of storedVariants) {
    await updateCurrentVariantInventory({
      producerProductData: producerLatestProductData,
      hubProductId,
      storedHubVariant: hubVariant,
      accessToken,
      shouldUpdateThePrice
    });
  }
};

const archiveProduct = async ({ hubProductId, gqlClient }) => {
  const variables = {
    input: {
      id: `gid://shopify/Product/${hubProductId}`,
      status: 'ARCHIVED'
    }
  };

  const data = await executeGraphQLQuery({
    gqlClient,
    QUERY: updateProductStatusMutation,
    variables
  });

  return data.productUpdate.product;
};

const updateExistingProductsUseCase = async ({
  userId,
  shouldUpdateThePrice = false
}) => {
  const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);

  const session = await shopify.config.sessionStorage.loadSession(sessionId);

  if (!session) {
    throwError(
      'Error from updateExistingProductsUseCase: Shopify Session not found'
    );
  }
  const gqlClient = new shopify.api.clients.Graphql({ session });

  const { accessToken } = await obtainValidAccessToken(userId);
  const productsWithVariants = await getProducerProducts(accessToken);

  if (productsWithVariants.length === 0) {
    return;
  }

  for (const product of productsWithVariants) {
    const { hubProductId, producerProductData } = product;
    const storedVariants = product.variants;

    if (producerProductData) {
      await updateSingleProduct({
        gqlClient,
        hubProductId,
        session,
        storedVariants,
        producerLatestProductData: producerProductData,
        shouldUpdateThePrice,
        accessToken
      });
    } else {
      await archiveProduct({ hubProductId, gqlClient });
    }
  }
};

export default updateExistingProductsUseCase;
