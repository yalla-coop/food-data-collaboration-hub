import { beforeAll, expect, test, vi } from "vitest";
import postOrder from "./post-order";
import axios from 'axios';

vi.mock('axios')

const order = {
  "@context": "http://static.datafoodconsortium.org/ontologies/context.json",
  "@id": "semanticId_1",
  "@type": "dfc-b:Order",
  "dfc-b:belongsTo": {
    "@id": "saleSessionId_1"
  },
  "dfc-b:date": "date",
  "dfc-b:hasPart": {
    "@id": "orderLineId_1"
  },
  "dfc-b:orderNumber": "0001",
  "dfc-b:orderedBy": {
    "@id": "personId_1"
  }
};

test("post order to FDC", async () => {
  
  axios.post.mockResolvedValue({
    data: 'data'
  })

  const fdcAPIURL = "http://localhost:3000";
  try {
    const { data } = await postOrder({ order, fdcAPIURL });
  } catch (error) {
    console.warn('Failed to send order to FDC', order, error);
  }

  expect(axios.post).toHaveBeenCalledWith('http://localhost:3000/orders', order);
});
