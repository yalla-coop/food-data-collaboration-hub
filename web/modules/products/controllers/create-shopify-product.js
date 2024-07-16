/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
import shopify from '../../../shopify.js';
import { getClient, query } from '../../../database/connect.js';

const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop(), 10);
};

const createProductMutation = `
      mutation CreateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            variants(first: 10) {
              edges {
                node {
                  id
                  inventoryItem {
                    id
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

const updateInventoryItemMutation = `
    mutation UpdateInventoryItem($input: InventoryItemUpdateInput!) {
      inventoryItemUpdate(input: $input) {
        inventoryItem {
          id
          tracked
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

const createShopifyProductAndInventoryItem = async (
  gqlClient,
  variantsMappingData,
  producerProductData
) => {
  const { parentProduct, retailProduct, wholesaleProduct } =
    variantsMappingData;

  const exitingImageAlt = parentProduct.images[0]?.alt;
  const newImageId = exitingImageAlt
    ? parentProduct.images.find((i) => i.alt === exitingImageAlt)?.id
    : null;

  const productInput = {
    title: producerProductData.title,
    bodyHtml: parentProduct.body_html,
    images: parentProduct.images.map((img) => ({
      src: img.src,
      altText: img.alt
    })),
    metafields: [
      {
        key: 'producer_product_id',
        namespace: 'global',
        value: producerProductData.id,
        type: 'single_line_text_field'
      }
    ],
    variants: [
      {
        option1: retailProduct.title,
        title: retailProduct.title,
        price: variantsMappingData.price,
        inventoryPolicy: wholesaleProduct.inventory_policy,
        fulfillmentService: wholesaleProduct.fulfillment_service,
        inventoryManagement: wholesaleProduct.inventory_management,
        inventoryQuantity:
          Number(variantsMappingData.noOfItemPerCase) *
          Number(wholesaleProduct.inventory_quantity),
        oldInventoryQuantity: wholesaleProduct.old_inventory_quantity,
        metafields: [
          {
            key: 'producer_variant_id',
            namespace: 'global',
            value: retailProduct.id,
            type: 'single_line_text_field'
          }
        ],
        image: newImageId ? { id: newImageId } : undefined
      }
    ]
  };

  const productCreateResponse = await gqlClient.query({
    data: {
      query: createProductMutation,
      variables: { input: productInput }
    }
  });

  const { data, errors } = productCreateResponse || {};

  if (errors) {
    throw new Error(errors[0].message);
  }
  const { productCreate: { product, userErrors } = {} } = data || {};

  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }

  const hubInventoryItemId = convertShopifyGraphQLIdToNumber(
    product.variants.edges[0].node.inventoryItem.id
  );

  const inventoryItemInput = {
    id: `gid://shopify/InventoryItem/${hubInventoryItemId}`,
    tracked: true
  };

  const inventoryItemUpdateResponse = await gqlClient.query({
    data: {
      query: updateInventoryItemMutation,
      variables: { input: inventoryItemInput }
    }
  });

  const { data: inventoryItemData, errors: inventoryItemErrors } =
    inventoryItemUpdateResponse || {};

  if (inventoryItemErrors) {
    throw new Error(inventoryItemErrors[0].message);
  }

  const {
    inventoryItemUpdate: {
      inventoryItem,
      userErrors: inventoryItemUserErrors
    } = {}
  } = inventoryItemData || {};

  if (inventoryItemUserErrors.length > 0) {
    throw new Error(inventoryItemUserErrors[0].message);
  }

  return { newProduct: product, newInventoryItem: inventoryItem };
};

const createShopifyProduct = async (req, res) => {
  try {
    const { session } = res.locals.shopify;
    const gqlClient = new shopify.api.clients.Graphql({ session });

    const { title, producerProductId, variantsMappingData } = req.body;

    const productExists = await query(
      `
    SELECT * FROM products WHERE producer_product_id = $1;
    `,
      [convertShopifyGraphQLIdToNumber(producerProductId)]
    );

    if (productExists.rows.length > 0) {
      throw new Error('Product already exists');
    }

    const { newProduct } = await createShopifyProductAndInventoryItem(
      gqlClient,
      variantsMappingData,
      { title, producerProductId }
    );

    const hubVariantId = convertShopifyGraphQLIdToNumber(
      newProduct.variants.edges[0].node.id
    );

    const { retailProduct, wholesaleProduct } = variantsMappingData;

    const client = await getClient();

    await client.query('BEGIN');

    try {
      const products = await query(
        `
      INSERT INTO products (producer_product_id,hub_product_id) VALUES ($1,$2) returning id;
      `,
        [
          convertShopifyGraphQLIdToNumber(producerProductId),
          convertShopifyGraphQLIdToNumber(newProduct.id)
        ],
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
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`,
        [
          convertShopifyGraphQLIdToNumber(retailProduct.id),
          hubVariantId,
          productId,
          Number(variantsMappingData.price),
          Number(variantsMappingData.addedValue),
          variantsMappingData.addedValueMethod,
          Number(variantsMappingData.originalPrice),
          Number(variantsMappingData.noOfItemPerCase),
          convertShopifyGraphQLIdToNumber(wholesaleProduct.id)
        ],
        client
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.log('Error creating Shopify product', err);
      throw new Error('Database error:', err);
    } finally {
      client.release();
    }

    return res.json({
      success: true
    });
  } catch (error) {
    console.warn('Could not create Shopify product', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default createShopifyProduct;
