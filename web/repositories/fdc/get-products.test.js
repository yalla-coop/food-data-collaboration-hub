import { beforeAll, expect, test, vi } from "vitest";
import getFDCProducts from "./get-products";
import axios from 'axios';

const json = `{"@context":"http://static.datafoodconsortium.org/ontologies/context.json","@id":"http://myplatform.com/catalog1","@type":"dfc-b:Catalog","dfc-b:lists":{"@id":"http://myplatform.com/catalogItem1"},"dfc-b:maintainedBy":{"@id":"http://myplatform.com/enterprise1"}}`;

vi.mock('axios')


test("get products from the FDC", async () => {
  
  axios.get.mockResolvedValue({
    data: json
  })

  const fdcAPIURL = "http://localhost:3000";
  try {
    const catalog = await getFDCProducts(fdcAPIURL);
    console.log('catalog is', catalog)
  } catch (error) {
    console.warn('Failed to get products from FDC', error);
  }

  //expect(axios.get).toHaveBeenCalledWith(`${fdcAPIURL}/catalog`, order);
});
