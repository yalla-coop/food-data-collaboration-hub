/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
import shopify from '../../../shopify.js';
import { getClient, query } from '../../../database/connect.js';
import {
  convertShopifyGraphQLIdToNumber,
  executeGraphQLQuery
} from '../../../utils/index.js';

const getLocationsQuery = `
query GetLocations {
  locations(first: 1) {
    edges {
      node {
        id
      }
    }
  }
}
`;

const createProductMutation = `
mutation CreateProductMutation($input: ProductInput!, $media: [CreateMediaInput!]!) {
  productCreate(
    input: $input
    media: $media
  ) {
    product {
      id
    }
  }
}`;

const createProductVariantMutation = `
mutation CreateProductVariantMutation($input: ProductVariantInput!) {
  productVariantCreate(
    input: $input,
  ) {
    productVariant {
      id
      inventoryItem {
        id
      }
    }
  }
}
`;

const createShopifyProduct = async ({
  gqlClient,
  parentProduct,
  producerProductId
}) => {
  const parentProductMediaInput = {
    originalSource: parentProduct.images?.[0].src,
    mediaContentType: 'IMAGE',
    alt: parentProduct.image.src.altText
  };

  const productInputs = {
    title: parentProduct.title,
    descriptionHtml: parentProduct.descriptionHtml,
    productType: parentProduct.productType,
    metafields: {
      key: 'producer_product_id',
      namespace: 'global',
      value: producerProductId,
      type: 'single_line_text_field'
    }
  };

  const data = await executeGraphQLQuery({
    gqlClient,
    QUERY: createProductMutation,
    variables: {
      input: productInputs,
      media: parentProductMediaInput
    }
  });
  return { addedHubProductId: data.productCreate?.product?.id };
};

const createShopifyProductVariant = async ({
  gqlClient,
  addedHubProductId,
  wholesaleProduct,
  retailProduct,
  variantsMappingDataPrice,
  variantsMappingDataNoOfItemPerCase
}) => {
  const locationsData = await executeGraphQLQuery({
    gqlClient,
    QUERY: getLocationsQuery
  });
  const locationId = locationsData.locations.edges[0].node.id;

  const productVariantInputs = {
    productId: addedHubProductId,
    options: [retailProduct.title],
    title: retailProduct.title,
    price: variantsMappingDataPrice,
    inventoryPolicy: wholesaleProduct.inventoryPolicy.toUpperCase(),
    inventoryItem: {
      tracked: wholesaleProduct.tracked
    },
    inventoryQuantities: {
      availableQuantity:
        Number(variantsMappingDataNoOfItemPerCase) *
        Number(wholesaleProduct.inventoryQuantity),
      locationId
    },
    metafields: {
      key: 'producer_variant_id',
      namespace: 'global',
      value: retailProduct.id,
      type: 'single_line_text_field'
    },
    mediaSrc: retailProduct.image.src || wholesaleProduct.image.src
  };

  const data = await executeGraphQLQuery({
    gqlClient,
    QUERY: createProductVariantMutation,
    variables: { input: productVariantInputs }
  });
  return { addedHubVariantId: data.productVariantCreate?.productVariant?.id };
};

const insertProductAndVariants = async ({
  client,
  producerProductId,
  addedHubProductId,
  addedHubVariantId,
  variantsMappingData
}) => {
  const {
    retailProduct,
    wholesaleProduct,
    price,
    addedValue,
    addedValueMethod,
    originalPrice,
    noOfItemPerCase
  } = variantsMappingData;

  await client.query('BEGIN');

  try {
    const products = await query(
      'INSERT INTO products (producer_product_id, hub_product_id) VALUES ($1, $2) RETURNING id;',
      [producerProductId, addedHubProductId],
      client
    );

    const { id: productId } = products.rows[0];

    await query(
      `INSERT INTO variants (
          producer_variant_id,
          hub_variant_id,
          product_id,
          price,
          added_value,
          added_value_method,
          original_price,
          no_of_items_per_package,
          mapped_variant_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        convertShopifyGraphQLIdToNumber(retailProduct.id),
        addedHubVariantId,
        productId,
        Number(price),
        Number(addedValue),
        addedValueMethod,
        Number(originalPrice),
        Number(noOfItemPerCase),
        convertShopifyGraphQLIdToNumber(wholesaleProduct.id)
      ],
      client
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error('Database error:', err);
  } finally {
    client.release();
  }
};

const createProductAndVariants = async (req, res) => {
  try {
    const { session } = res.locals.shopify;
    const gqlClient = new shopify.api.clients.Graphql({ session });

    const { producerProductId, variantsMappingData } = req.body;
    const {
      retailProduct,
      wholesaleProduct,
      parentProduct,
      price,
      noOfItemPerCase
    } = variantsMappingData;

    const productExists = await query(
      `
    SELECT * FROM products WHERE producer_product_id = $1;
    `,
      [convertShopifyGraphQLIdToNumber(producerProductId)]
    );

    if (productExists.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Product already exists' });
    }

    const { addedHubProductId } = await createShopifyProduct({
      gqlClient,
      parentProduct,
      producerProductId
    });

    const { addedHubVariantId } = await createShopifyProductVariant({
      gqlClient,
      addedHubProductId,
      wholesaleProduct,
      retailProduct,
      variantsMappingDataPrice: price,
      variantsMappingDataNoOfItemPerCase: noOfItemPerCase
    });

    const client = await getClient();

    await insertProductAndVariants({
      client,
      producerProductId: convertShopifyGraphQLIdToNumber(producerProductId),
      addedHubProductId: convertShopifyGraphQLIdToNumber(addedHubProductId),
      addedHubVariantId: convertShopifyGraphQLIdToNumber(addedHubVariantId),
      variantsMappingData
    });

    return res.json({ success: true });
  } catch (error) {
    console.log('Could not create Shopify product', error);
    return res.status(500).json({
      success: false,
      error: error?.response || error?.message
    });
  }
};

export default createProductAndVariants;
