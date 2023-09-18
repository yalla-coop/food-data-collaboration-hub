import updateExistingProductsCronJob from './updateExistingProductsCronJob';

describe('updateExistingProductsCronJob', () => {
  it('should update existing products', async () => {
    await updateExistingProductsCronJob();
  }, 10000000);
});
