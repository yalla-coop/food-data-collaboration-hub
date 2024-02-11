import dotenv from 'dotenv';
import axios from 'axios';
import { query } from '../../../database/connect.js';
import { generateShopifyFDCProducts } from '../../../connector/productUtils.js';
import { throwError } from '../../../utils/index.js';

dotenv.config();

const PRODUCER_SHOP_URL = process.env.PRODUCER_SHOP_URL;
const PRODUCER_SHOP = process.env.PRODUCER_SHOP;

const getProducerProducts = async () => {
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

  try {
    const result = await query(sql);
    const hubStoreProducts = result.rows;

    if (hubStoreProducts.length === 0) {
      return [];
    }

    if (hubStoreProducts.length > 250) {
      throwError('getProducerProducts: Too many products in the hub store');
    }

    const producerProductsIds = hubStoreProducts
      .map((p) => p.producerProductId)
      .join(',');

    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products/all?shop=${PRODUCER_SHOP}`,
      {
        ids: producerProductsIds
      }
    );
    const producerProducts = await generateShopifyFDCProducts(data.products);

    if (!Array.isArray(producerProducts) || producerProducts.length === 0) {
      throwError(
        'getProducerProducts: No products found in the producer store'
      );
    }

    const products = hubStoreProducts.map((product) => {
      const updatedProductJsonData = producerProducts.find(
        (p) => Number(p.id) === Number(product.producerProductId)
      );

      return {
        ...product,
        updatedProductJsonData
      };
    });

    const productsWithVariants = products
      .filter((product) => product.updatedProductJsonData)
      .map((product) => {
        const variants = product.variants.map((variant) => {
          const producerVariantData =
            product.updatedProductJsonData.variants.find(
              (v) => Number(v.id) === Number(variant.producerVariantId)
            );

          const updatedVariant = {
            ...variant,
            updatedPrice: producerVariantData.price,
            updatedInventoryQuantity: producerVariantData.inventory_quantity,
            producerVariantData
          };

          return updatedVariant;
        });

        return {
          ...product,
          producerProductData: product.updatedProductJsonData,
          variants
        };
      });

    return productsWithVariants;
  } catch (err) {
    throwError('Error from getProducerProducts', err);
  }
};

export default getProducerProducts;
