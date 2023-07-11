import {beforeAll, expect, test, vi} from 'vitest';
import {connector} from '../../../connector/index.js';
import FDC from '../../../repositories/fdc/index.js';
import getFDCProducts from './get-fdc-products.js';

const json = `{
  "@context": "https://www.datafoodconsortium.org",
  "@id": "https://food-data-collaboration-hub-82234d1e2fc5.herokuapp.com/catalog/catalog.json",
  "@type": "dfc-b:Catalog",
  "dfc-b:lists": [
      {
          "@id": "https://food-data-collaboration-hub-82234d1e2fc5.herokuapp.com/catalog/catalogItem1.json"
      },
      {
          "@id": "https://food-data-collaboration-hub-82234d1e2fc5.herokuapp.com/catalog/catalogItem2"
      }
  ],
  "dfc-b:maintainedBy": {
      "@id": "https://food-data-collaboration-hub-82234d1e2fc5.herokuapp.com/catalog/enterprise1.json"
  }
}`

vi.mock('../../../repositories/fdc/index.js')

beforeAll(async () => {

  /*
  catalog = await createCatalog();
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

  order = await createOrder(shopifyOrderBody);
  */
});

test('import catalog', async () => {

  FDC.getProducts.mockResolvedValue(json)

  let products = await getFDCProducts();
  console.log('getFDCProducts test products', products)

  //const serialized = await connector.export([order]);
  //expect(serialized).toStrictEqual(json);
});
