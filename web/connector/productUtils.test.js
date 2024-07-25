import {
  exportedDFCProducerProducts,
  importedShopifyProductsFromDFC
} from './mocks';
import { generateShopifyFDCProducts } from './productUtils';

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

    const variant = result[0].variants[0];

    expect(variant.inventoryQuantity).toEqual(0);
    expect(variant.inventoryPolicy).toEqual('continue');
  });
});
