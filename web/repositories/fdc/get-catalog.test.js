import { beforeAll, expect, test, vi } from "vitest";
import getFDCCatalog from "./get-catalog";
import axios from 'axios';

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
