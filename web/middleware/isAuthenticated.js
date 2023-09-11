import { Issuer } from 'openid-client';

const clientId = process.env.OIDC_CLIENT_ID;
const clientSecret = process.env.OIDC_CLIENT_SECRET;
const issuerURL = process.env.OIDC_ISSUER;

const isAuthenticated = async (req, res, next) => {
  if (!req.user)
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
      isAuthenticated: false
    });

  const accessToken = req.user.accessToken;

  const issuer = await Issuer.discover(issuerURL);

  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret
  });

  const tokenSet = await client.introspect(accessToken);

  if (!tokenSet.active) {
    return res.status(403).json({
      success: false,
      message: 'User not authenticated',
      isAuthenticated: false
    });
  }

  return next();
};

export default isAuthenticated;
