import axios from "axios";
import { connector } from "../../connector/index.js";

const getProducts = async ({ fdcAPIURL }) => {
  // TODO - Add KeyCloak authentication
  try {
      const { data } = await axios.get(`${fdcAPIURL}/catalog`);
      console.log('getProducts data', data)
      const catalog = connector.import(data)
      return catalog;
  } catch (error) {
      console.warn("Failed to GET products from FDC", error.response);
      throw error;
  }
}

export default getProducts;