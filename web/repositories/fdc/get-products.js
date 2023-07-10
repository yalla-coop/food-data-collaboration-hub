import axios from "axios";
import { connector } from "../../connector/index.js";

const mockCatalog = `{"@context":"https://www.datafoodconsortium.org","@id":"http://myplatform.com/catalog1","@type":"dfc-b:Catalog","dfc-b:lists":[{"@id":"http://myplatform.com/catalogItem1"},{"@id":"http://myplatform.com/catalogItem2"}],"dfc-b:maintainedBy":{"@id":"http://myplatform.com/enterprise1"}}`

const getProducts = async ({ fdcAPIURL }) => {
  // TODO - Add KeyCloak authentication

  //const catalog = await connector.import(mockCatalog)  
  //console.log('getProducts catalog', catalog)

  // Returning mockCatalog for now
  return mockCatalog;

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