export const CREATE_PRODUCT = `
mutation CreateProduct($title: String) {
  productCreate(input: {title: $title, productType: "Toy", vendor: "Toys"}) {
    product {
      id
      title
    }
  }
}
`;
