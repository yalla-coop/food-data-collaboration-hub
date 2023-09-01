import * as dotenv from 'dotenv';
dotenv.config();

import * as yup from 'yup';
const schema = yup
  .object()
  .shape({
    SHOPIFY_API_KEY: yup.string(),
    SHOPIFY_API_SECRET_KEY: yup.string(),
    SHOPIFY_ACCESS_TOKEN: yup.string(),
    SHOPIFY_WEBHOOK_SECRET: yup.string(),
    OIDC_CLIENT_ID: yup.string(),
    OIDC_CLIENT_SECRET: yup.string(),
    FDC_API_URL: yup.string(),
    HOST: yup.string()
  })
  .required();

const createConfig = () => {
  let envVars;
  try {
    envVars = schema.validateSync(process.env, { stripUnknown: false });
  } catch (error) {
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
  }

  return {
    SHOPIFY_API_KEY: envVars.SHOPIFY_API_KEY,
    SHOPIFY_API_SECRET_KEY: envVars.SHOPIFY_API_SECRET_KEY,
    SHOPIFY_ACCESS_TOKEN: envVars.SHOPIFY_ACCESS_TOKEN,
    SHOPIFY_WEBHOOK_SECRET: envVars.SHOPIFY_WEBHOOK_SECRET,
    OIDC_CLIENT_ID: envVars.OIDC_CLIENT_ID,
    OIDC_CLIENT_SECRET: envVars.OIDC_CLIENT_SECRET,
    FDC_API_URL: envVars.FDC_API_URL,
    HOST: envVars.HOST
  };
};

export const config = createConfig();
