import shopify from '../../shopify.js';

const getClient = (session) => {
  return new shopify.api.clients.Graphql({
    session
  });
};

export default getClient;
