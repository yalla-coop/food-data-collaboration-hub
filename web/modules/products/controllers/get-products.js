import { query } from '../../../database/connect.js';

const getProducts = async (req, res) => {
  try {
    const sql = `
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
        'mapped_variant_id', v.mapped_variant_id,
        'no_of_items_per_package', v.no_of_items_per_package,
        'number_of_excess_orders', v.number_of_excess_orders,
        'number_of_remaining_orders', v.number_of_remaining_orders,
        'added_value_method', v.added_value_method)
    ) as variants
FROM products as p INNER JOIN variants as v ON p.id = v.product_id
    GROUP BY p.id
    `;
    const result = await query(sql);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export default getProducts;
