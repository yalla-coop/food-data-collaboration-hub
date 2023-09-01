export const DELETE_PRODUCT = `
mutation DeleteProduct($id: ID!) {
    productDelete(input: {id: $id})
    {
      deletedProductId
    }
  }
`;
