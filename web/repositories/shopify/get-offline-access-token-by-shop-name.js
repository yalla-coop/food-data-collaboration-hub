import shopify from '../../shopify.js';

export const getOfflineAccessTokenByShopName = async (shopName) => {
  const id = shopify.api.session.getOfflineId(shopName);

  const session = await shopify.config.sessionStorage.findSessionsByShop(
    shopName
  );

  if (!session) return undefined;

  return session.accessToken;
};
