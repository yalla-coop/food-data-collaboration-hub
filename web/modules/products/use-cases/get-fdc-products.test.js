import {beforeAll, expect, test, vi} from 'vitest';
import {connector} from '../../../connector/index.js';

let catalog;
//const json = `{"@context":"http://static.datafoodconsortium.org/ontologies/context.json","@id":"820982911946154500","@type":"dfc-b:Order","dfc-b:belongsTo":{"@id":"saleSessionId"},"dfc-b:date":"2023-07-03T10:08:34-04:00","dfc-b:hasPart":[{"@id":"487817672276298560"},{"@id":"976318377106520300"}],"dfc-b:orderNumber":"820982911946154500","dfc-b:orderedBy":{"@id":"115310627314723950"}}`;
const json = `{"@context":"https://www.datafoodconsortium.org","@id":"http://myplatform.com/catalog1","@type":"dfc-b:Catalog","dfc-b:lists":{"@id":"http://myplatform.com/catalogItem1"},"dfc-b:maintainedBy":{"@id":"http://myplatform.com/enterprise1"}}`;

beforeAll(async () => {

  catalog = await createCatalog();
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

  order = await createOrder(shopifyOrderBody);
  */
});

test('import catalog', async () => {

  //const serialized = await connector.export([order]);
  //expect(serialized).toStrictEqual(json);
});
