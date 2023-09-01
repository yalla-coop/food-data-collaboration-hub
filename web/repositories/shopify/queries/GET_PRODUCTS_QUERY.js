export const GET_PRODUCTS_QUERY = `
{
  products(first: 5) {
    edges {
      node {
        id
        description
        descriptionHtml
        productType
        title
        totalInventory
        status
        handle
        metafields(first: 10) {
          edges {
            node {
              id
              key
              value
            }
          }
        }
        priceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
`;
