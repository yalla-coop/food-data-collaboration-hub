/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
import shopify from '../../../shopify.js';
import { query } from '../../../database/connect.js';

const updateShopifyVariant = async (req, res) => {
  try {
    const { session } = res.locals.shopify;
    const { variantsMappingData } = req.body;

    const variantId = req.params.variantId

    const variantExists = await query('SELECT * FROM variants WHERE hub_variant_id = $1;', [variantId]);

    if (variantExists.rows.length !== 1) {
      throw new Error(`Variant ${variantId} doesn't exist`);
    }

    const existingVariant = new shopify.api.rest.Variant({
      session
    });
    existingVariant.id = variantId;
    existingVariant.price =  variantsMappingData.price,
    await existingVariant.saveAndUpdate();

    await query('UPDATE variants SET price = $1, added_value = $2, added_value_method = $3 WHERE hub_variant_id = $4', [variantsMappingData.price, variantsMappingData.addedValue, variantsMappingData.addedValueMethod, variantId]);

    return res.json({
      success: true
    });
  } catch (error) {
    console.error('Could not update Shopify product', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default updateShopifyVariant;
