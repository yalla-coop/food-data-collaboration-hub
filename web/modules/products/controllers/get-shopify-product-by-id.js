import shopify from '../../../shopify.js';

const getProductByIdQuery = `
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      title
      descriptionHtml
      images(first: 10) {
        edges {
          node {
            id
            altText
            originalSrc
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price
          }
        }
      }
    }
  }
`;

const getShopifyProductById = async (req, res, next) => {
  const { session } = res.locals.shopify;
  const gqlClient = new shopify.api.clients.Graphql({ session });

  try {
    const productId = `gid://shopify/Product/${req.params.id}`;
    const response = await gqlClient.query({
      data: {
        query: getProductByIdQuery,
        variables: { id: productId }
      }
    });

    const { data, errors } = response;

    if (errors) {
      console.warn('GraphQL errors:', errors);
      return res.status(500).json({
        success: false,
        errors
      });
    }

    return res.json({
      success: true,
      product: data.product
    });
  } catch (err) {
    console.warn('Could not get Shopify product', err);
    return next(err);
  }
};

export default getShopifyProductById;
