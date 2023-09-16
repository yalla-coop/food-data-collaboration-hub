import shopify from '../../../shopify.js';
import { query } from '../../../database/connect.js';

const variantUpdate = async ({
  session,
  storedVariants,
  hubVariants,
  producerVariant,
  inventoryLevels
}) => {
  const hubVariantId = storedVariants.find(
    (v) => Number(v.producerVariantId) === Number(producerVariant.id)
  ).hubVariantId;

  const inventoryItemId = hubVariants.find(
    (v) => Number(v.id) === Number(hubVariantId)
  ).inventory_item_id;

  const inventoryLevel = new shopify.api.rest.InventoryLevel({
    session
  });

  await inventoryLevel.set({
    inventory_item_id: inventoryItemId,
    available: producerVariant.inventory_quantity,
    location_id: inventoryLevels.find(
      (l) => l.inventory_item_id === inventoryItemId
    ).location_id
  });
};

const productUpdate = async (req, res) => {
  try {
    const shopName = req.body.shopName;
    const { id: producerProductId, variants: producerVariants } =
      req.body.product;

    const sessions = await shopify.config.sessionStorage.findSessionsByShop(
      shopName
    );

    const session = sessions[0];

    const selectProducerProductIdAndVariantsAtHubStoreQuery = `
    SELECT p.* ,
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'id', v.id,
        'producer_variant_id', v.producer_variant_id,
        'hub_variant_id', v.hub_variant_id,
        'product_id', v.product_id,
        'price', v.price,
        'added_value', v.added_value,
        'original_price', v.original_price,
        'added_value_method', v.added_value_method)
        ) as variants
        FROM products as p INNER JOIN variants as v ON p.id = v.product_id
    WHERE p.producer_product_id = $1
    GROUP BY p.id
    `;

    const result = await query(
      selectProducerProductIdAndVariantsAtHubStoreQuery,
      [producerProductId]
    );

    const hubProductId = result.rows[0].hubProductId;
    const storedVariants = result.rows[0].variants;

    if (!hubProductId) {
      return res.sendStatus(200);
    }
    const hubProduct = new shopify.api.rest.Product({
      session
    });
    hubProduct.id = hubProductId;
    await hubProduct.saveAndUpdate();

    const hubVariants = await shopify.api.rest.Variant.all({
      session,
      product_id: hubProductId
    });

    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session,
      inventory_item_ids: hubVariants.map((v) => v.inventory_item_id).join(',')
    });

    for (let producerVariant of producerVariants) {
      await variantUpdate({
        session,
        storedVariants,
        hubVariants,
        inventoryLevels,
        producerVariant
      });
    }

    const setProducerProductIdIsUpdated = `
    UPDATE products
    SET 
    is_updated_on_producer_side = true,
    updated_product_json_data = $2
    WHERE producer_product_id = $1
  `;

    await query(setProducerProductIdIsUpdated, [
      producerProductId,
      req.body.product
    ]);

    return res.sendStatus(200);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: e
    });
  }
};

export default productUpdate;
