export function exportedDFCProducerProducts(stockLimitation = 55) {
  return `{
    "@context": "https://www.datafoodconsortium.org",
    "@graph": [
      {
        "@id": "_:b1663",
        "@type": "dfc-b:QuantitativeValue",
        "dfc-b:hasUnit": "dfc-m:Kilogram",
        "dfc-b:value": "0.4"
      },
      {
        "@id": "_:b1664",
        "@type": "dfc-b:Price",
        "dfc-b:VATrate": "0",
        "dfc-b:hasUnit": "dfc-m:Euro",
        "dfc-b:value": "2.09"
      },
      {
        "@id": "_:b1665",
        "@type": "dfc-b:QuantitativeValue",
        "dfc-b:hasUnit": "dfc-m:Kilogram",
        "dfc-b:value": "4.8"
      },
      {
        "@id": "_:b1666",
        "@type": "dfc-b:Price",
        "dfc-b:VATrate": "0",
        "dfc-b:hasUnit": "dfc-m:Euro",
        "dfc-b:value": "18.85"
      },
      {
        "@id": "_:b1667",
        "@type": "dfc-b:QuantitativeValue",
        "dfc-b:hasUnit": "dfc-m:Piece",
        "dfc-b:value": "12"
      },
      {
        "@id": "_:b1668",
        "@type": "dfc-b:QuantitativeValue",
        "dfc-b:hasUnit": "dfc-m:Piece",
        "dfc-b:value": "1"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041",
        "@type": "dfc-b:SuppliedProduct",
        "dfc-b:description": "<p>description</p>",
        "dfc-b:hasQuantity": "_:b1663",
        "dfc-b:image": "https://cdn.shopify.com/s/files/1/0716/0601/0129/files/Pack-Can-Baked-Beans-1800x6_983x656_513758e6-2616-4687-a8b2-ba6dde864923.jpg?v=1721912980",
        "dfc-b:name": "Baked British Beans - Retail can, 400g (can)",
        "dfc-b:referencedBy": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/CatalogItem"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/AsPlannedConsumptionFlow",
        "@type": "dfc-b:AsPlannedConsumptionFlow",
        "dfc-b:consumes": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041",
        "dfc-b:hasQuantity": "_:b1667"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/AsPlannedProductionFlow",
        "@type": "dfc-b:AsPlannedProductionFlow",
        "dfc-b:hasQuantity": "_:b1668",
        "dfc-b:produces": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508737809"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/AsPlannedTransformation",
        "@type": "dfc-b:AsPlannedTransformation",
        "dfc-b:hasIncome": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/AsPlannedConsumptionFlow",
        "dfc-b:hasOutcome": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/AsPlannedProductionFlow"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/CatalogItem",
        "@type": "dfc-b:CatalogItem",
        "dfc-b:offeredThrough": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/Offer",
        "dfc-b:sku": "NCBB/T4",
        "dfc-b:stockLimitation": "${stockLimitation}"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508705041/Offer",
        "@type": "dfc-b:Offer",
        "dfc-b:hasPrice": {
          "@id": "_:b1664"
        }
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508737809",
        "@type": "dfc-b:SuppliedProduct",
        "dfc-b:description": "<p>description</p>",
        "dfc-b:hasQuantity": "_:b1665",
        "dfc-b:image": "https://cdn.shopify.com/s/files/1/0716/0601/0129/files/Pack-Can-Baked-Beans-1800x6_983x656_513758e6-2616-4687-a8b2-ba6dde864923.jpg?v=1721912980",
        "dfc-b:name": "Baked British Beans - Case, 12 x 400g (can)",
        "dfc-b:referencedBy": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508737809/CatalogItem"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508737809/CatalogItem",
        "@type": "dfc-b:CatalogItem",
        "dfc-b:offeredThrough": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508737809/Offer",
        "dfc-b:sku": "NCBB/CD",
        "dfc-b:stockLimitation": "4"
      },
      {
        "@id": "http://localhost:36329/api/dfc/Enterprises/fdc-producer/SuppliedProducts/50004508737809/Offer",
        "@type": "dfc-b:Offer",
        "dfc-b:hasPrice": {
          "@id": "_:b1666"
        }
      }
    ]
  }`;
}

export const exportedSingleTransformlessProducts = `{
  "@context": "https://www.datafoodconsortium.org",
  "@graph": [
      {
          "@id": "_:b228",
          "@type": "dfc-b:QuantitativeValue",
          "dfc-b:hasUnit": "dfc-m:Kilogram",
          "dfc-b:value": "1"
      },
      {
          "@id": "_:b229",
          "@type": "dfc-b:Price",
          "dfc-b:VATrate": "0",
          "dfc-b:hasUnit": "dfc-m:Euro",
          "dfc-b:value": "5.99"
      },
      {
          "@id": "_:b230",
          "@type": "dfc-b:QuantitativeValue",
          "dfc-b:hasUnit": "dfc-m:Kilogram",
          "dfc-b:value": "6"
      },
      {
          "@id": "_:b231",
          "@type": "dfc-b:Price",
          "dfc-b:VATrate": "0",
          "dfc-b:hasUnit": "dfc-m:Euro",
          "dfc-b:value": "27.00"
      },
      {
          "@id": "_:b232",
          "@type": "dfc-b:QuantitativeValue",
          "dfc-b:hasUnit": "dfc-m:Kilogram",
          "dfc-b:value": "3"
      },
      {
          "@id": "_:b233",
          "@type": "dfc-b:Price",
          "dfc-b:VATrate": "0",
          "dfc-b:hasUnit": "dfc-m:Euro",
          "dfc-b:value": "15.99"
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236913913",
          "@type": "dfc-b:SuppliedProduct",
          "dfc-b:description": "<span>hello</span>",
          "dfc-b:hasQuantity": "_:b228",
          "dfc-b:image": "https://cdn.shopify.com/s/files/1/0694/6491/6217/products/image_5611ad7e-65bf-4c16-b54f-9086acff0892.jpg?v=1710254054",
          "dfc-b:name": "Botanical Flour, #2 Meadow Blend - Catering, kilo, 1kg",
          "dfc-b:referencedBy": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236913913/CatalogItem"
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236913913/CatalogItem",
          "@type": "dfc-b:CatalogItem",
          "dfc-b:offeredThrough": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236913913/Offer",
          "dfc-b:sku": "NFB2/1K",
          "dfc-b:stockLimitation": "-3"
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236913913/Offer",
          "@type": "dfc-b:Offer",
          "dfc-b:hasPrice": {
              "@id": "_:b229"
          }
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236946681",
          "@type": "dfc-b:SuppliedProduct",
          "dfc-b:description": "<span>hello</span>",
          "dfc-b:hasQuantity": "_:b230",
          "dfc-b:image": "https://cdn.shopify.com/s/files/1/0694/6491/6217/products/image_5611ad7e-65bf-4c16-b54f-9086acff0892.jpg?v=1710254054",
          "dfc-b:name": "Botanical Flour, #2 Meadow Blend - Case, 6 x 1kg",
          "dfc-b:referencedBy": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236946681/CatalogItem"
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236946681/CatalogItem",
          "@type": "dfc-b:CatalogItem",
          "dfc-b:offeredThrough": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236946681/Offer",
          "dfc-b:sku": "NFB2/C6",
          "dfc-b:stockLimitation": "-2"
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236946681/Offer",
          "@type": "dfc-b:Offer",
          "dfc-b:hasPrice": {
              "@id": "_:b231"
          }
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236979449",
          "@type": "dfc-b:SuppliedProduct",
          "dfc-b:description": "<span>hello</span>",
          "dfc-b:hasQuantity": "_:b232",
          "dfc-b:image": "https://cdn.shopify.com/s/files/1/0694/6491/6217/products/image_5611ad7e-65bf-4c16-b54f-9086acff0892.jpg?v=1710254054",
          "dfc-b:name": "Botanical Flour, #2 Meadow Blend - Catering, small, 3kg",
          "dfc-b:referencedBy": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236979449/CatalogItem"
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236979449/CatalogItem",
          "@type": "dfc-b:CatalogItem",
          "dfc-b:offeredThrough": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236979449/Offer",
          "dfc-b:sku": "NFB2/3K",
          "dfc-b:stockLimitation": "-7"
      },
      {
          "@id": "http://localhost:3629/api/dfc/Enterprises/alex-fdc-producer/SuppliedProducts/44518236979449/Offer",
          "@type": "dfc-b:Offer",
          "dfc-b:hasPrice": {
              "@id": "_:b233"
          }
      }
  ]
}`;

export const importedShopifyProductsFromDFC = [
  {
    parentProduct: {
      id: '50004508705041',
      title: 'Baked British Beans - Retail can, 400g (can)',
      descriptionHtml: '<p>description</p>',
      productType: 'Savory Snacks',
      image: {
        src: 'https://cdn.shopify.com/s/files/1/0716/0601/0129/files/Pack-Can-Baked-Beans-1800x6_983x656_513758e6-2616-4687-a8b2-ba6dde864923.jpg?v=1721912980',
        altText: 'Baked British Beans - Retail can, 400g (can)'
      },
      variants: [
        {
          id: '50004508705041',
          title: 'Baked British Beans - Retail can, 400g (can)',
          price: 2.09,
          weight: 0.4,
          weightUnit: 'kg',
          inventoryQuantity: 55,
          sku: 'NCBB/T4',
          taxable: 0,
          tracked: true,
          inventoryPolicy: 'deny',
          image: {
            src: 'https://cdn.shopify.com/s/files/1/0716/0601/0129/files/Pack-Can-Baked-Beans-1800x6_983x656_513758e6-2616-4687-a8b2-ba6dde864923.jpg?v=1721912980',
            altText: 'Baked British Beans - Retail can, 400g (can)'
          }
        }
      ],
      images: [
        {
          altText: 'Baked British Beans - Retail can, 400g (can)',
          position: 1,
          product_id: '50004508705041',
          src: 'https://cdn.shopify.com/s/files/1/0716/0601/0129/files/Pack-Can-Baked-Beans-1800x6_983x656_513758e6-2616-4687-a8b2-ba6dde864923.jpg?v=1721912980',
          variant_ids: []
        }
      ]
    },
    retailProduct: {
      id: '50004508705041',
      title: 'Baked British Beans - Retail can, 400g (can)',
      price: 2.09,
      weight: 0.4,
      weightUnit: 'kg',
      inventoryQuantity: 55,
      sku: 'NCBB/T4',
      taxable: 0,
      tracked: true,
      inventoryPolicy: 'deny',
      image: {
        src: 'https://cdn.shopify.com/s/files/1/0716/0601/0129/files/Pack-Can-Baked-Beans-1800x6_983x656_513758e6-2616-4687-a8b2-ba6dde864923.jpg?v=1721912980',
        altText: 'Baked British Beans - Retail can, 400g (can)'
      }
    },
    wholesaleProduct: {
      id: '50004508737809',
      title: 'Baked British Beans - Case, 12 x 400g (can)',
      price: 18.85,
      weight: 4.8,
      weightUnit: 'kg',
      inventoryQuantity: 4,
      sku: 'NCBB/CD',
      taxable: 0,
      tracked: true,
      inventoryPolicy: 'deny',
      image: {
        src: 'https://cdn.shopify.com/s/files/1/0716/0601/0129/files/Pack-Can-Baked-Beans-1800x6_983x656_513758e6-2616-4687-a8b2-ba6dde864923.jpg?v=1721912980',
        altText: 'Baked British Beans - Case, 12 x 400g (can)'
      }
    },
    itemsPerWholesaleVariant: 12
  }
];
