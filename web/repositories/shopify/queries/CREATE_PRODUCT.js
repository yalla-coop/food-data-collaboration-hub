export const CREATE_PRODUCT = `
mutation CreateProduct($input: ProductInput!) {
  productCreate(input: $input) {
    product {
      id
      title
    }
    userErrors {
      message
      field
    }
  }
}
`;
