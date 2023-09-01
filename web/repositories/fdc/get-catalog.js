import axios from "axios";
import { connector } from "../../connector/index.js";

const mockCatalog = `{
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

const getProducts = async ({ fdcAPIURL }) => {
  // TODO - Add KeyCloak authentication

  const catalog = await connector.import(mockCatalog)  
  console.log('getProducts catalog', catalog)

  // Returning mockCatalog for now
  return catalog;

  /*
  try {
      const { data } = await axios.get(`${fdcAPIURL}/catalog`);
      console.log('getProducts data', data)
      const catalog = connector.import(data)
      return catalog;
  } catch (error) {
      console.warn("Failed to GET products from FDC", error.response);
      throw error;
  }
  */
}

export default getProducts;