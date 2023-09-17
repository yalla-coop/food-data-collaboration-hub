import moment from 'moment';
import shopify from '../../../shopify.js';
import dotenv from 'dotenv';
import { query } from '../../../database/connect.js';
import createOrderAtProducerStore from '../../../modules/orders/use-cases/create-order-at-producer-store.js';

const MAX_REQUESTS_PER_SECOND = 2;

const delayFun = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateHubProduct = async ({ session, product }) => {
  const hubProduct = new shopify.api.rest.Product({
    session
  });

  hubProduct.id = product.hubProductId;
  hubProduct.title = product.producerProductData.title;
  hubProduct.body_html = product.producerProductData.body_html;
  hubProduct.vendor = product.producerProductData.vendor;
  hubProduct.product_type = product.producerProductData.product_type;
  hubProduct.tags = product.producerProductData.tags;

  hubProduct.variants = product.variants.map((variant) => {
    const updatedPrice = parseFloat(variant.updatedPrice, 10);

    const price =
      variant.addedValueMethod === 'percentage'
        ? updatedPrice +
          (updatedPrice * parseFloat(variant.addedValue, 10)) / 100
        : updatedPrice + parseFloat(variant.addedValue);

    return {
      id: variant.hubVariantId,
      price: parseFloat(price.toFixed(2), 10)
    };
  });

  await hubProduct.saveAndUpdate();

  return hubProduct;
};

export const updateHubVariantInventoryLevels = async ({
  session,
  locationId,
  updatedInventoryQuantity,
  inventoryItemId
}) => {
  const inventoryLevel = new shopify.api.rest.InventoryLevel({
    session
  });

  await inventoryLevel.set({
    inventory_item_id: inventoryItemId,
    available: updatedInventoryQuantity,
    location_id: locationId
  });
};

export const getProducerProducts = async () => {
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
      'added_value_method', v.added_value_method)
      ) as variants
      FROM products as p INNER JOIN variants as v ON p.id = v.product_id
  GROUP BY p.id
  `;

  try {
    const result = await query(sql);
    const products = result.rows;

    const productsWithVariants = products
      .filter((product) => product.updatedProductJsonData)
      .map((product) => {
        const variants = product.variants.map((variant) => {
          const producerVariantData =
            product.updatedProductJsonData.variants.find(
              (v) => Number(v.id) === Number(variant.producerVariantId)
            );

          return {
            ...variant,
            updatedPrice: producerVariantData.price,
            updatedInventoryQuantity: producerVariantData.inventoryQuantity,
            producerVariantData
          };
        });

        return {
          ...product,
          producerProductData: product.updatedProductJsonData,
          variants
        };
      });

    return productsWithVariants;
  } catch (err) {
    console.log('errrr', err);
    throw new Error('DATABASE ERROR :', err);
  }
};

const createSalesSessionUseCase = async (
  { startDate, sessionDurationInDays, user, session },
  client
) => {
  try {
    const startDateValue = moment(startDate);
    const endDate = moment(startDate).add(sessionDurationInDays, 'days');

    await query(
      'UPDATE sales_sessions SET is_active = false WHERE is_active = true',
      [],
      client
    );

    const sql =
      'INSERT INTO sales_sessions (start_date, end_date,session_duration,is_active ) VALUES ($1,$2,$3,$4) RETURNING id';
    const result = await query(
      sql,
      [
        startDateValue.toISOString(),
        endDate.toISOString(),
        sessionDurationInDays,
        true
      ],
      client
    );

    const salesSessionId = result.rows[0].id;

    const { order } = await createOrderAtProducerStore({
      user
    });

    await query(
      'UPDATE sales_sessions SET order_id = $1 WHERE id = $2',
      [order.id, salesSessionId],
      client
    );

    const productsWithVariants = await getProducerProducts();

    let hubProducts = [];

    for (let product of productsWithVariants) {
      const hubProduct = await updateHubProduct({
        session,
        product
      });

      hubProducts.push(hubProduct);
    }

    if (hubProducts.length === 0) {
      return;
    }

    const hubVariants = hubProducts.flatMap((p) => p.variants);

    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session,
      limit: 250,
      inventory_item_ids: hubProducts
        .flatMap((p) => p.variants)
        .map((v) => v.inventory_item_id)
        .join(',')
    });

    for (let product of productsWithVariants) {
      for (let variant of product.variants) {
        const inventoryItemId = hubVariants.find(
          (v) => Number(v.id) === Number(variant.hubVariantId)
        ).inventory_item_id;

        await updateHubVariantInventoryLevels({
          session,
          updatedInventoryQuantity: variant.updatedInventoryQuantity,
          inventoryItemId,
          locationId: inventoryLevels.find(
            (l) => l.inventory_item_id === inventoryItemId
          ).location_id
        });

        await delayFun(1000 / MAX_REQUESTS_PER_SECOND);
      }
    }
  } catch (error) {
    console.error(error);
    console.log('Failed to create sales session', error);
    throw new Error('Failed to create sales session', error);
  }
};

export default createSalesSessionUseCase;
