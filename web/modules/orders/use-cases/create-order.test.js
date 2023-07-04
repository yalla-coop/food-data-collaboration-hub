import {beforeAll, expect, test, vi} from 'vitest';
import createOrder from './create-order.js';
import {connector} from '../../../../connector/index.js';

let order;
const json = `{"@context":"http://static.datafoodconsortium.org/ontologies/context.json","@id":"820982911946154500","@type":"dfc-b:Order","dfc-b:belongsTo":{"@id":"saleSessionId"},"dfc-b:date":"2023-07-03T10:08:34-04:00","dfc-b:hasPart":[{"@id":"487817672276298560"},{"@id":"976318377106520300"}],"dfc-b:orderNumber":"820982911946154500","dfc-b:orderedBy":{"@id":"115310627314723950"}}`;

beforeAll(async () => {

  const shopifyOrderBody = {
    id: 820982911946154500,
    admin_graphql_api_id: 'gid://shopify/Order/820982911946154508',
    app_id: null,
    browser_ip: null,
    buyer_accepts_marketing: true,
    cancel_reason: 'customer',
    cancelled_at: '2023-07-03T10:08:34-04:00',
    cart_token: null,
    checkout_id: null,
    checkout_token: null,
    client_details: null,
    closed_at: null,
    company: null,
    confirmation_number: null,
    confirmed: false,
    contact_email: 'jon@example.com',
    created_at: '2023-07-03T10:08:34-04:00',
    currency: 'GBP',
    current_subtotal_price: '249.98',
    current_subtotal_price_set: {
      shop_money: { amount: '249.98', currency_code: 'GBP' },
      presentment_money: { amount: '249.98', currency_code: 'GBP' }
    },
    current_total_additional_fees_set: null,
    current_total_discounts: '0.00',
    current_total_discounts_set: {
      shop_money: { amount: '0.00', currency_code: 'GBP' },
      presentment_money: { amount: '0.00', currency_code: 'GBP' }
    },
    current_total_duties_set: null,
    current_total_price: '249.98',
    current_total_price_set: {
      shop_money: { amount: '249.98', currency_code: 'GBP' },
      presentment_money: { amount: '249.98', currency_code: 'GBP' }
    },
    current_total_tax: '0.00',
    current_total_tax_set: {
      shop_money: { amount: '0.00', currency_code: 'GBP' },
      presentment_money: { amount: '0.00', currency_code: 'GBP' }
    },
    customer_locale: 'en',
    device_id: null,
    discount_codes: [],
    email: 'jon@example.com',
    estimated_taxes: false,
    financial_status: 'voided',
    fulfillment_status: 'pending',
    landing_site: null,
    landing_site_ref: null,
    location_id: null,
    merchant_of_record_app_id: null,
    name: '#9999',
    note: null,
    note_attributes: [],
    number: 234,
    order_number: 1234,
    order_status_url: 'https://yalla-cooperative.myshopify.com/71606010129/orders/123456abcd/authenticate?key=abcdefg',
    original_total_additional_fees_set: null,
    original_total_duties_set: null,
    payment_gateway_names: [ 'visa', 'bogus' ],
    phone: null,
    po_number: null,
    presentment_currency: 'GBP',
    processed_at: null,
    reference: null,
    referring_site: null,
    source_identifier: null,
    source_name: 'web',
    source_url: null,
    subtotal_price: '244.98',
    subtotal_price_set: {
      shop_money: { amount: '244.98', currency_code: 'GBP' },
      presentment_money: { amount: '244.98', currency_code: 'GBP' }
    },
    tags: '',
    tax_exempt: false,
    tax_lines: [],
    taxes_included: false,
    test: true,
    token: '123456abcd',
    total_discounts: '5.00',
    total_discounts_set: {
      shop_money: { amount: '5.00', currency_code: 'GBP' },
      presentment_money: { amount: '5.00', currency_code: 'GBP' }
    },
    total_line_items_price: '249.98',
    total_line_items_price_set: {
      shop_money: { amount: '249.98', currency_code: 'GBP' },
      presentment_money: { amount: '249.98', currency_code: 'GBP' }
    },
    total_outstanding: '249.98',
    total_price: '254.98',
    total_price_set: {
      shop_money: { amount: '254.98', currency_code: 'GBP' },
      presentment_money: { amount: '254.98', currency_code: 'GBP' }
    },
    total_shipping_price_set: {
      shop_money: { amount: '10.00', currency_code: 'GBP' },
      presentment_money: { amount: '10.00', currency_code: 'GBP' }
    },
    total_tax: '0.00',
    total_tax_set: {
      shop_money: { amount: '0.00', currency_code: 'GBP' },
      presentment_money: { amount: '0.00', currency_code: 'GBP' }
    },
    total_tip_received: '0.00',
    total_weight: 0,
    updated_at: '2023-07-03T10:08:34-04:00',
    user_id: null,
    billing_address: {
      first_name: 'Steve',
      address1: '123 Shipping Street',
      phone: '555-555-SHIP',
      city: 'Shippington',
      zip: '40003',
      province: 'Kentucky',
      country: 'United States',
      last_name: 'Shipper',
      address2: null,
      company: 'Shipping Company',
      latitude: null,
      longitude: null,
      name: 'Steve Shipper',
      country_code: 'US',
      province_code: 'KY'
    },
    customer: {
      id: 115310627314723950,
      email: 'john@example.com',
      accepts_marketing: false,
      created_at: null,
      updated_at: null,
      first_name: 'John',
      last_name: 'Smith',
      state: 'disabled',
      note: null,
      verified_email: true,
      multipass_identifier: null,
      tax_exempt: false,
      phone: null,
      email_marketing_consent: {
        state: 'not_subscribed',
        opt_in_level: null,
        consent_updated_at: null
      },
      sms_marketing_consent: null,
      tags: '',
      currency: 'GBP',
      accepts_marketing_updated_at: null,
      marketing_opt_in_level: null,
      tax_exemptions: [],
      admin_graphql_api_id: 'gid://shopify/Customer/115310627314723954',
      default_address: {
        id: 715243470612851200,
        customer_id: 115310627314723950,
        first_name: null,
        last_name: null,
        company: null,
        address1: '123 Elm St.',
        address2: null,
        city: 'Ottawa',
        province: 'Ontario',
        country: 'Canada',
        zip: 'K2H7A8',
        phone: '123-123-1234',
        name: '',
        province_code: 'ON',
        country_code: 'CA',
        country_name: 'Canada',
        default: true
      }
    },
    discount_applications: [],
    fulfillments: [],
    line_items: [
      {
        id: 487817672276298560,
        admin_graphql_api_id: 'gid://shopify/LineItem/487817672276298554',
        attributed_staffs: [Array],
        fulfillable_quantity: 1,
        fulfillment_service: 'manual',
        fulfillment_status: null,
        gift_card: false,
        grams: 100,
        name: 'Aviator sunglasses',
        price: '89.99',
        price_set: [Object],
        product_exists: true,
        product_id: 788032119674292900,
        properties: [],
        quantity: 1,
        requires_shipping: true,
        sku: 'SKU2006-001',
        taxable: true,
        title: 'Aviator sunglasses',
        total_discount: '0.00',
        total_discount_set: [Object],
        variant_id: null,
        variant_inventory_management: null,
        variant_title: null,
        vendor: null,
        tax_lines: [],
        duties: [],
        discount_allocations: []
      },
      {
        id: 976318377106520300,
        admin_graphql_api_id: 'gid://shopify/LineItem/976318377106520349',
        attributed_staffs: [],
        fulfillable_quantity: 1,
        fulfillment_service: 'manual',
        fulfillment_status: null,
        gift_card: false,
        grams: 1000,
        name: 'Mid-century lounger',
        price: '159.99',
        price_set: [Object],
        product_exists: true,
        product_id: 788032119674292900,
        properties: [],
        quantity: 1,
        requires_shipping: true,
        sku: 'SKU2006-020',
        taxable: true,
        title: 'Mid-century lounger',
        total_discount: '0.00',
        total_discount_set: [Object],
        variant_id: null,
        variant_inventory_management: null,
        variant_title: null,
        vendor: null,
        tax_lines: [],
        duties: [],
        discount_allocations: []
      }
    ],
    payment_terms: null,
    refunds: [],
    shipping_address: {
      first_name: 'Steve',
      address1: '123 Shipping Street',
      phone: '555-555-SHIP',
      city: 'Shippington',
      zip: '40003',
      province: 'Kentucky',
      country: 'United States',
      last_name: 'Shipper',
      address2: null,
      company: 'Shipping Company',
      latitude: null,
      longitude: null,
      name: 'Steve Shipper',
      country_code: 'US',
      province_code: 'KY'
    },
    shipping_lines: [
      {
        id: 271878346596884000,
        carrier_identifier: null,
        code: null,
        discounted_price: '10.00',
        discounted_price_set: [Object],
        phone: null,
        price: '10.00',
        price_set: [Object],
        requested_fulfillment_service_id: null,
        source: 'shopify',
        title: 'Generic Shipping',
        tax_lines: [],
        discount_allocations: []
      }
    ]
  }

  /*
  const data = {
    id: 'semanticId_1',
    clientId: 'personId_1',
    saleSessionId: 'saleSessionId_1',
    number: '0001',
    date: 'date',
    lines: [
      {
        orderLineId: 'orderLineId_1'
      }
    ]
  };
  */

  order = await createOrder(shopifyOrderBody);
});

test('export order', async () => {

  const serialized = await connector.export([order]);
  expect(serialized).toStrictEqual(json);
});
