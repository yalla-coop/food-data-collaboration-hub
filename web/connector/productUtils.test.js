const {
  exportedDFCProducerProducts,
  importedShopifyProductsFromDFC
} = require('./mocks');
const { generateShopifyFDCProducts } = require('./productUtils');

describe('generateShopifyFDCProducts', () => {
  it('should generate shopify FDC products from dfc exported JSON-LD', async () => {
    const result = await generateShopifyFDCProducts(
      exportedDFCProducerProducts
    );
    expect(result).toBeInstanceOf(Array);
    expect(result).toEqual(importedShopifyProductsFromDFC);
  }, 15000);
});
