const catalog = JSON.parse(`
{
  "@context": [
      "http://static.datafoodconsortium.org/ontologies/context.json",
      {
        "@base":"http://maPlateformeNationale/"
      }
    ],
  "@graph" : [
    {
      "@id": "person/personId",
      "@type": "dfc-b:Person",
      "dfc-b:familyName": "Doe",
      "dfc-b:firstName": "Jhon",
      "dfc-b:hasAdress": {
        "@type": "dfc-b:Address",
        "dfc-b:city": "",
        "dfc-b:country": "",
        "dfc-b:postcode": "",
        "dfc-b:street": ""
      },
      "dfc-b:affiliates": [
        "entreprise/entrepriseId"
      ]
    },
    {
      "@id": "entreprise/entrepriseId",
      "@type": "dfc-b:Entreprise",
      "dfc-b:VATnumber": "",
      "dfc-b:defines": [
        "customerCategory/customerCategoryId1",
        "customerCategory/customerCategoryId2"
      ],
      "dfc-b:supplies": [
        "suppliedProduct/item3",
        "suppliedProduct/item4"
      ],
      "dfc-b:manages": [
        "catalogItem/catalogItemId1",
        "catalogItem/catalogItemId2"
      ]
    },
    {
      "@id": "brand/brandId1",
      "@type": "dfc-b:Brand",
      "dfc-b:description": "brand description 1",
      "dfc-b:description":"label brand 1"
    },
    {
      "@id": "customerCategory/customerCategoryId1",
      "@type": "dfc-b:CustomerCategory",
      "dfc-b:description": "member"
    },
    {
      "@id": "customerCategory/customerCategoryId2",
      "@type": "dfc-b:CustomerCategory",
      "dfc-b:description": "non member"
    },
    {
      "@id": "catalogItem/catalogItemId1",
      "@type": "dfc-b:CatalogItem",
      "dfc-b:references": "/suppliedProduct/item3",
      "dfc-b:sku": "catalog item gtin or sku",
      "dfc-b:stockLimitation": "999",
      "dfc-b:offeredThrough": [
          "offer/offerId1",
          "offer/offerId2"
      ]
    },
    {
      "@id": "catalogItem/catalogItemId2",
      "@type": "dfc-b:CatalogItem",
      "dfc-b:sku": "catalog item gtin or sku",
      "dfc-b:stockLimitation": "999",
      "dfc-b:references": "/suppliedProduct/item4",
      "dfc-b:offeredThrough": [
        "offer/offerId3",
        "offer/offerId4"
      ]
    },
    {
      "@id": "offer/offerId1",
      "@type": "dfc-b:Offer",
      "dfc-b:offeres": "/customerCategory/customerCategoryId1",
      "dfc-b:price": "0",
      "dfc-b:stockLimitation": "999"
    },
    {
      "@id": "offer/offerId2",
      "@type": "dfc-b:Offer",
      "dfc-b:offeres": "/customerCategory/customerCategoryId2",
      "dfc-b:price": "999",
      "dfc-b:stockLimitation": "999"
    },
    {
      "@id": "offer/offerId3",
      "@type": "dfc-b:Offer",
      "dfc-b:offeres": "/customerCategory/customerCategoryId1",
      "dfc-b:price": "000",
      "dfc-b:stockLimitation": "999"
    },
    {
      "@id": "offer/offerId4",
      "@type": "dfc-b:Offer",
      "dfc-b:offeres": "/customerCategory/customerCategoryId2",
      "dfc-b:price": "999",
      "dfc-b:stockLimitation": "999"
    }
  ]
}
`);
const convertResponseToGraphData = (req, res, next) => {
  const products = res.locals.products;

  // const suppliedProducts = products.map((p) => createSuppliedProduct(p.node));

  // catalog['@graph'].push(...[]);

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(products);
};

export default convertResponseToGraphData;
