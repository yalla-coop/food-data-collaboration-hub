import {
  exportedDFCProducerProducts,
  importedShopifyProductsFromDFC,
  exportedSingleTransformlessProducts
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

    const variant = result[0].parentProduct.variants[0];

    expect(variant.inventoryQuantity).toEqual(0);
    expect(variant.inventoryPolicy).toEqual('CONTINUE');
  });

  it('Can import single products that dont appear on transformations', async () => {
    const result = await generateShopifyFDCProducts(exportedSingleTransformlessProducts);

    expect(result).toHaveLength(3);

    expect(result[0].retailProduct.title).toEqual('Botanical Flour, #2 Meadow Blend - Catering, kilo, 1kg');
    expect(result[0].wholesaleProduct.title).toEqual('Botanical Flour, #2 Meadow Blend - Catering, kilo, 1kg');
    expect(result[1].retailProduct.title).toEqual('Botanical Flour, #2 Meadow Blend - Case, 6 x 1kg');
    expect(result[1].wholesaleProduct.title).toEqual('Botanical Flour, #2 Meadow Blend - Case, 6 x 1kg');
    expect(result[2].retailProduct.title).toEqual('Botanical Flour, #2 Meadow Blend - Catering, small, 3kg');
    expect(result[2].wholesaleProduct.title).toEqual('Botanical Flour, #2 Meadow Blend - Catering, small, 3kg');
  }, 15000)
});
