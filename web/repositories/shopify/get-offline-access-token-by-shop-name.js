import shopify from '../../shopify.js';

export const getOfflineAccessTokenByShopName = async (shopName) => {
  const sessionId = shopify.api.session.getOfflineId(shopName);

  const session = shopify.config.sessionStorage.loadSession(sessionId);

  if (!session) {
    throw new Error('Shopify Session not found');
  }

  if (!session) return undefined;

  return session.accessToken;
};
