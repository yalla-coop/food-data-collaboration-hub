import dotenv from 'dotenv';
import shopify from '../../../shopify.js';
import getProducerProducts from './get-producer-products.js';
import { updateCurrentVariantInventory } from '../../../webhooks/updateCurrentVariantInventory.js';
import { executeGraphQLQuery, throwError } from '../../../utils/index.js';

dotenv.config();

// const MAX_REQUESTS_PER_SECOND = 2;

// const delayFun = (ms) =>
//   new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });

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
  shouldUpdateThePrice = false
}) => {
  const productVariables = {
    input: {
      id: `gid://shopify/Product/${hubProductId}`,
      status: 'ACTIVE'
    }
  };

  const productUpdateData = await executeGraphQLQuery(
    gqlClient,
    updateProductStatusMutation,
    productVariables
  );

  if (productUpdateData.productUpdate.userErrors.length > 0) {
    throw new Error(productUpdateData.productUpdate.userErrors[0].message);
  }

  for (const hubVariant of storedVariants) {
    await updateCurrentVariantInventory({
      producerProductData: producerLatestProductData,
      hubProductId,
      storedHubVariant: hubVariant,
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

  const data = executeGraphQLQuery({
    gqlClient,
    query: updateProductStatusMutation,
    variables
  });

  return data.productUpdate.product;
};

const updateExistingProductsUseCase = async ({
  accessToken,
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
    const gqlClient = new shopify.api.clients.Graphql({ session });

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
          shouldUpdateThePrice
        });
      } else {
        await archiveProduct({ hubProductId, gqlClient });
      }
    }
  } catch (e) {
    throwError('Error from updateExistingProductsUseCase', e);
  }
};

export default updateExistingProductsUseCase;
