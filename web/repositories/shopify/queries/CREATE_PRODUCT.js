export const CREATE_PRODUCT = `
mutation CreateProduct($input: ProductInput!) {
  productCreate(input: $input) {
    product {
      id
      title
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
    userErrors {
      message
      field
    }
  }
}
`;
