import { Issuer } from "openid-client";
import * as Sentry from "@sentry/node";
import axios from "axios";

const clientId = process.env.OIDC_CLIENT_ID;
const clientSecret = process.env.OIDC_CLIENT_SECRET;
const issuerURL = process.env.OIDC_ISSUER;

const isAuthenticated = async (req, res, next) => {
  const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        isAuthenticated: false,
      });
    }

    const { accessToken } = req.user;

    const issuer = await Issuer.discover(issuerURL);

    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
    });

    const accessTokenSet = await client.introspect(accessToken);

    if (!accessTokenSet.active) {
      return res.status(403).json({
        success: false,
        message: "User not authenticated",
        isAuthenticated: false,
      });
    }

    try {
      // Set user hub information
      const { locals: { shopify: { session: { shop } = {} } = {} } = {} } =
        res || {};
      if (req.user.id && shop) {
        await axios.post(
          `${PRODUCER_SHOP_URL}fdc/hub-users/${req.user.id}?shop=${PRODUCER_SHOP}`,
          {
            userId: req.user.id,
            accessToken: req.user.accessToken,
            hubShop: shop,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
    } catch (err) {
      console.log("error in storing user information ", err.message);
      Sentry.captureException(err);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default isAuthenticated;
