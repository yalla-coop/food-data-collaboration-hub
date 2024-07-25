export function exportedDFCProducerProducts(stockLimitation = 55) {
  return `{
    "@context": "https://www.datafoodconsortium.org",
    "@graph": [
        {
            "@id": "_:b5",
            "@type": "dfc-b:QuantitativeValue",
            "dfc-b:hasUnit": "dfc-m:Kilogram",
            "dfc-b:value": "0"
        },
        {
            "@id": "_:https://www.testing/product/7898317750424/variant/43305180201112/inventory/45401870631064/price",
            "@type": "dfc-b:Price",
            "dfc-b:VATrate": "1",
            "dfc-b:hasUnit": "dfc-m:Euro",
            "dfc-b:value": "2.49"
        },
        {
            "@id": "https://www.testing/product/7898317750424/variant/43305180201112/inventory/45401870631064/catalogItem",
            "@type": "dfc-b:CatalogItem",
            "dfc-b:offeredThrough": "https://www.testing/product/7898317750424/variant/43305180201112/inventory/45401870631064/offer",
            "dfc-b:stockLimitation": "${stockLimitation}"
        },
        {
            "@id": "https://www.testing/product/7898317750424/variant/43305180201112/inventory/45401870631064/offer",
            "@type": "dfc-b:Offer",
            "dfc-b:hasPrice": {
                "@id": "_:https://www.testing/product/7898317750424/variant/43305180201112/inventory/45401870631064/price"
            }
        },
        {
            "@id": "https://www.testing/product/7898317750424/variant/43305180201112/inventory/45401870631064?imageId=44001459798168",
            "@type": "dfc-b:SuppliedProduct",
            "dfc-b:hasQuantity": "_:b5",
            "dfc-b:image": "https://cdn.shopify.com/s/files/1/0587/9735/9256/products/37-cammalina-fron.jpg?v=1706882031",
            "dfc-b:name": "Retail pack, 300g",
            "dfc-b:referencedBy": "https://www.testing/product/7898317750424/variant/43305180201112/inventory/45401870631064/catalogItem"
        },
        {
            "@id": "https://www.testing/product/7898317750424?handle=camelina-seed-trade&imageId=44001459765400",
            "@type": "dfc-b:SuppliedProduct",
            "dfc-b:description": "<p><strong>Camelina, also known as Gold of Pleasure, has been grown in England for thousands of years for its tasty seeds and oil. Sprinkle on salads, use in baking, add to smoothies, or use as a vegan egg replacement. </strong></p>\\n<!-- split --><h3>Complete Product Details</h3><p>Sprinkle on salads, add to smoothies, use in baking.</p>\\n<h5 class=\\"product-detail-title\\">Cooking instructions</h5>\\n<p>Soak 1 tablespoon of seeds in 3 tablespoons of warm water for 30 minutes to replace one egg in vegan baking.</p>\\n<h5 class=\\"product-detail-title\\">Ingredients</h5>\\n<p>Camelina seeds</p>\\n<h5 class=\\"product-detail-title\\">Allergy information</h5>\\n<p>No Allergens</p>\\n<table width=\\"100%\\">\\n<tbody>\\n<tr>\\n<td><strong>Typical values</strong></td>\\n<td><strong>Per 100g</strong></td>\\n</tr>\\n<tr>\\n<td>Energy</td>\\n<td>1439kJ (346kcal)</td>\\n</tr>\\n<tr>\\n<td>Fat</td>\\n<td>12.1g</td>\\n</tr>\\n<tr>\\n<td>of which saturates</td>\\n<td>1.7g</td>\\n</tr>\\n<tr>\\n<td>Carbohydrate</td>\\n<td>16.4g</td>\\n</tr>\\n<tr>\\n<td>of which sugars</td>\\n<td>1.2g</td>\\n</tr>\\n<tr>\\n<td>Fibre</td>\\n<td>35.1g</td>\\n</tr>\\n<tr>\\n<td>Protein</td>\\n<td>25.4g</td>\\n</tr>\\n<tr>\\n<td>Salt</td>\\n<td>0g</td>\\n</tr>\\n</tbody>\\n</table><p>Camelina Seeds are high in protein, a good source of Omega 3 oils and rich in antioxidants such as vitamin E</p><h5 class=\\"product-detail-title\\">More</h5>\\n<p>Grown by Peter Fairs in Essex and Andy Howard in Kent.</p>",
            "dfc-b:image": "https://cdn.shopify.com/s/files/1/0587/9735/9256/products/Cameilna-Seeds-1800x1200_8c00a108-d8f7-4920-9bac-758a2c6a8b56.jpg?v=1706882031",
            "dfc-b:name": "Camelina Seed"
        }
    ]
}`;
}

export const importedShopifyProductsFromDFC = [
  {
    id: '7898317750424',
    title: 'Camelina Seed',
    descriptionHtml:
      '<p><strong>Camelina, also known as Gold of Pleasure, has been grown in England for thousands of years for its tasty seeds and oil. Sprinkle on salads, use in baking, add to smoothies, or use as a vegan egg replacement. </strong></p>\n' +
      '<!-- split --><h3>Complete Product Details</h3><p>Sprinkle on salads, add to smoothies, use in baking.</p>\n' +
      '<h5 class="product-detail-title">Cooking instructions</h5>\n' +
      '<p>Soak 1 tablespoon of seeds in 3 tablespoons of warm water for 30 minutes to replace one egg in vegan baking.</p>\n' +
      '<h5 class="product-detail-title">Ingredients</h5>\n' +
      '<p>Camelina seeds</p>\n' +
      '<h5 class="product-detail-title">Allergy information</h5>\n' +
      '<p>No Allergens</p>\n' +
      '<table width="100%">\n' +
      '<tbody>\n' +
      '<tr>\n' +
      '<td><strong>Typical values</strong></td>\n' +
      '<td><strong>Per 100g</strong></td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>Energy</td>\n' +
      '<td>1439kJ (346kcal)</td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>Fat</td>\n' +
      '<td>12.1g</td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>of which saturates</td>\n' +
      '<td>1.7g</td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>Carbohydrate</td>\n' +
      '<td>16.4g</td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>of which sugars</td>\n' +
      '<td>1.2g</td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>Fibre</td>\n' +
      '<td>35.1g</td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>Protein</td>\n' +
      '<td>25.4g</td>\n' +
      '</tr>\n' +
      '<tr>\n' +
      '<td>Salt</td>\n' +
      '<td>0g</td>\n' +
      '</tr>\n' +
      '</tbody>\n' +
      '</table><p>Camelina Seeds are high in protein, a good source of Omega 3 oils and rich in antioxidants such as vitamin E</p><h5 class="product-detail-title">More</h5>\n' +
      '<p>Grown by Peter Fairs in Essex and Andy Howard in Kent.</p>',
    productType: 'Savory Snacks',
    handle: 'camelina-seed-trade',
    image: {
      id: '44001459765400',
      src: 'https://cdn.shopify.com/s/files/1/0587/9735/9256/products/Cameilna-Seeds-1800x1200_8c00a108-d8f7-4920-9bac-758a2c6a8b56.jpg?v=1706882031',
      altText: 'Camelina Seed'
    },
    variants: [
      {
        id: '43305180201112',
        product_id: '7898317750424',
        inventory_item_id: '45401870631064',
        title: 'Retail pack, 300g',
        price: 2.49,
        weight: 0,
        weight_unit: 'kg',
        inventoryQuantity: 55,
        sku: undefined,
        taxable: true,
        tracked: undefined,
        inventoryPolicy: 'deny',
        fulfillmentService: 'manual',
        inventoryManagement: 'shopify',
        image: {
          id: '44001459798168',
          src: 'https://cdn.shopify.com/s/files/1/0587/9735/9256/products/37-cammalina-fron.jpg?v=1706882031',
          altText: 'Retail pack, 300g'
        }
      }
    ],
    images: [
      {
        id: '44001459765400',
        altText: 'Camelina Seed',
        position: 1,
        product_id: '7898317750424',
        admin_graphql_api_id: 'gid://shopify/ProductImage/44001459765400',
        src: 'https://cdn.shopify.com/s/files/1/0587/9735/9256/products/Cameilna-Seeds-1800x1200_8c00a108-d8f7-4920-9bac-758a2c6a8b56.jpg?v=1706882031',
        variant_ids: []
      },
      {
        id: '44001459798168',
        altText: 'Retail pack, 300g',
        position: 2,
        product_id: '7898317750424',
        admin_graphql_api_id: 'gid://shopify/ProductImage/44001459798168',
        src: 'https://cdn.shopify.com/s/files/1/0587/9735/9256/products/37-cammalina-fron.jpg?v=1706882031',
        variant_ids: ['43305180201112']
      }
    ]
  }
];
