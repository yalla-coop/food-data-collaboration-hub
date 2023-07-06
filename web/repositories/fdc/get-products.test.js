import { beforeAll, expect, test, vi } from "vitest";
import getFDCProducts from "./get-products";
import axios from 'axios';

const json = `{
  "@context": {
    "DFC": "http://static.datafoodconsortium.org/ontologies/DFC_FullModel.owl#",
    "@base": "http://maPlateformeNationale"
  },
  "@id": "/entreprise/maGrandeEntreprise",
  "@type": "DFC:Entreprise",
  "DFC:supplies":[
    {
      "@id":"/suppliedProduct/item3",
      "DFC:hasUnit":{
        "@id":"/unit/kg"
      },
      "DFC:quantity":"0,5",
      "DFC:description":"Aillet botte 1 pièce"
    },
    {
      "@id":"/suppliedProduct/item4",
      "DFC:hasUnit":{
        "@id":"/unit/unit"
      },
      "DFC:quantity":"1",
      "DFC:description":"Aromates-Romarin Botte 1 pièce"
    }
  ]
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
