/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
import shopify from '../../../shopify.js';
import { query } from '../../../database/connect.js';

const updateVariantMutation = `
  mutation UpdateVariant($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      productVariant {
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

const updateShopifyVariant = async (req, res) => {
  try {
    const { session } = res.locals.shopify;
    const gqlClient = new shopify.api.clients.Graphql({ session });

    const { variantsMappingData } = req.body;
    const { variantId } = req.params;

    const variantExists = await query(
      'SELECT * FROM variants WHERE hub_variant_id = $1;',
      [variantId]
    );

    if (variantExists.rows.length !== 1) {
      throw new Error(`Variant ${variantId} doesn't exist`);
    }

    const variantInput = {
      id: variantId,
      price: variantsMappingData.price
    };

    const response = await gqlClient.request(updateVariantMutation, {
      variables: { input: variantInput }
    });

    const { data, errors } = response;

    if (errors) {
      console.error('updateShopifyVariant graphQL errors:', errors);
      return res.status(500).json({
        success: false,
        errors: "Couldn't update Shopify product variant"
      });
    }

    const { productVariantUpdate: { productVariant, userErrors } = {} } =
      data || {};

    if (userErrors && userErrors.length > 0) {
      const errorMessage = userErrors
        .map((err) => `${err.field}: ${err.message}`)
        .join(', ');
      throw new Error(`GraphQL user errors: ${errorMessage}`);
    }

    await query(
      'UPDATE variants SET price = $1, added_value = $2, added_value_method = $3 WHERE hub_variant_id = $4',
      [
        variantsMappingData.price,
        variantsMappingData.addedValue,
        variantsMappingData.addedValueMethod,
        variantId
      ]
    );

    return res.json({
      success: true,
      variant: productVariant
    });
  } catch (error) {
    console.error('Could not update Shopify product', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Could not update Shopify product'
    });
  }
};

export default updateShopifyVariant;
