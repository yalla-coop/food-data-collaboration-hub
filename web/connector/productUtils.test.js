const {
  exportedDFCProducerProducts,
  importedShopifyProductsFromDFC
} = require('./mocks');
const { generateShopifyFDCProducts } = require('./productUtils');

describe('generateShopifyFDCProducts', () => {
  it('should generate shopify FDC products from dfc exported JSON-LD', async () => {
    const result = await generateShopifyFDCProducts(
      exportedDFCProducerProducts()
    );
    expect(result).toBeInstanceOf(Array);
    expect(result).toEqual(importedShopifyProductsFromDFC);
  }, 15000);

  it('variant inventory management set to continue when stock limitation -1', async () => {
    const result = await generateShopifyFDCProducts(
      exportedDFCProducerProducts(-1)
    );

    const variant = result[0].variants[0]

    expect(variant.inventory_quantity).toEqual(-1);
    expect(variant.inventory_policy).toEqual('continue');
  });
});
