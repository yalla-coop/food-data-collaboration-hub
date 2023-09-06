import shopify from '../../shopify.js';

export const createProduct = async ({
  session,
  title,
  handle,
  variants,
  producerProductId
}) => {
  const product = new shopify.api.rest.Product({
    session
  });

  product.title = title;
  product.handle = handle;
  product.metafields = [
    {
      key: 'producer_product_id',
      namespace: 'global',
      value: producerProductId,
      type: 'single_line_text_field'
    }
  ];
  product.variants = variants;

  product.variants?.forEach((variant) => {
    variant.metafields = [
      {
        key: 'producer_variant_id',
        namespace: 'global',
        value: variant.id,
        type: 'single_line_text_field'
      }
    ];
  });

  await product.save({
    update: true
  });

  // save this product id to my database

  
};
