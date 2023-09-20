import getProducerProducts from './get-producer-products';

describe('get-producer-products', () => {
  it('should return producer products', async () => {
    const products = await getProducerProducts();

    console.log(products);
  });
});
