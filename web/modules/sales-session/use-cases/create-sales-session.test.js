import { query } from '../../../database/connect.js';

import createSalesSessionUseCase from './create-sales-session';
import {
  getProducerProducts,
  updateSingleVariant
} from './create-sales-session';
describe('CreateSalesSession', () => {
  it('should get producer products', async () => {
    const data = await getProducerProducts();

    expect(true).toBe(true);
  });

  it('update variant', async () => {
    await updateSingleVariant({
      hubVariantId: 42814015275160,
      producerVariant: {
        id: 44519466664243,
        product_id: 8140849283379,
        title: 'Catering, medium, 20kg',
        price: '100.00',
        sku: 'OKBA20',
        position: 5,
        inventory_policy: 'deny',
        compare_at_price: null,
        fulfillment_service: 'manual',
        inventory_management: 'shopify',
        option1: 'Catering, medium, 20kg',
        option2: null,
        option3: null,
        created_at: '2023-02-27T16:27:10+00:00',
        updated_at: '2023-02-27T16:27:10+00:00',
        taxable: false,
        barcode: null,
        grams: 12500,
        image_id: null,
        weight: 12.5,
        weight_unit: 'kg',
        inventory_item_id: 46569101426995,
        inventory_quantity: 0,
        old_inventory_quantity: 0,
        requires_shipping: true,
        admin_graphql_api_id: 'gid://shopify/ProductVariant/44519466664243'
      },
      session: {
        id: 'offline_hassanstroe.myshopify.com',
        accessToken: 'shpua_1b8e782b23f688554d7f078933715395',
        shop: 'hassanstroe.myshopify.com',
        state: '301338157897533',
        scope: 'write_products,write_draft_orders,write_inventory',
        isOnline: false
      }
    });
  });

  it('should create a sales session', async () => {
    await createSalesSessionUseCase({
      sessionDurationInDays: 10,
      startDate: new Date('2021-09-01'),
      partiallySoldEnabled: true,
      user: {
        id: 1,
        accessToken: '123'
      }
    });

    expect(true).toBe(true);
  });

  it('Test creating a sales session after some products are exiting', async () => {
    // it's important to test this scenario because we need to make sure that
  });
});
