import getProducerProducts from './get-producer-products';

//todo: Very flawed test

describe.skip('get-producer-products', () => {
  it('should return producer products', async () => {
    const products = await getProducerProducts();

    console.log(products);
  });
});
