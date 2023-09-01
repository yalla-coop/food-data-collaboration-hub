import { connector } from '../../../connector/index.js';
import FDC from '../../../repositories/fdc/index.js';
import { config } from '../../../config.js';

const mockProducts = [
  {
    '@context': 'https://www.datafoodconsortium.org',
    '@graph': [
      {
        '@id':
          'https://food-data-collaboration-hub-82234d1e2fc5.herokuapp.com/catalog/suppliedProduct1.json',
        '@type': 'dfc-b:SuppliedProduct',
        'dfc-b:alcoholPercentage': '0',
        'dfc-b:description': 'Tomato',
        price: '0.40',
        'dfc-b:hasAllergenCharacteristic': {
          '@id': '_:b2'
        },
        'dfc-b:hasCertification': [
          {
            '@id': 'dfc-f:Organic-AB'
          },
          {
            '@id': 'dfc-f:Organic-EU'
          }
        ],
        'dfc-b:hasClaim': 'dfc-f:NoAddedSugars',
        'dfc-b:hasGeographicalOrigin': 'dfc-f:CentreValLoire',
        'dfc-b:hasNatureOrigin': {
          '@id': 'dfc-f:PlantOrigin'
        },
        'dfc-b:hasNutrientCharacteristic': {
          '@id': '_:b4'
        },
        'dfc-b:hasPartOrigin': {
          '@id': 'dfc-f:Fruit'
        },
        'dfc-b:hasPhysicalCharacteristic': {
          '@id': '_:b6'
        },
        'dfc-b:hasQuantity': '_:b1',
        'dfc-b:hasType': 'dfc-pt:round-tomato',
        'dfc-b:lifetime': 'a week',
        'dfc-b:referencedBy':
          'https://food-data-collaboration-hub-82234d1e2fc5.herokuapp.com/catalog/catalogItem',
        'dfc-b:totalTheoreticalStock': '2.23',
        'dfc-b:usageOrStorageCondition': 'free text'
      },
      {
        '@id': 'suppliedProduct/item4',
        '@type': 'dfc-b:SuppliedProduct',
        'dfc-b:hasQuantity': {
          '@type': 'dfc-b:QuantitiveValue',
          'dfc-b:hasUnit': 'dfc-m:Gram',
          'dfc-b:value': '1000'
        },
        'dfc-p:hasType': 'dfc-pt:strawberry',
        price: '0.20',
        'dfc-b:description': 'Strawberry',
        'dfc-b:totalTheoriticalStock': '999',
        'dfc-b:image': 'supply image url',
        'dfc-b:lifeTime': 'supply lifeTime'
      }
    ]
  }
];

const getFDCProducts = async () => {
  /*
  const json = await FDC.getProducts(config.FDC_API_URL)
  const catalog = await connector.import(json)
  const products = await catalog[0].getItems()
  */

  // The connector is giving too many errors, returning mock data for now
  return mockProducts;
};

export default getFDCProducts;
