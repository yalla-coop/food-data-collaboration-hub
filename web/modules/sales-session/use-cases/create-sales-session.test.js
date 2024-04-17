
import createSalesSessionUseCase from './create-sales-session';
describe('CreateSalesSession', () => {

  it('should create a sales session', async () => {
    await createSalesSessionUseCase({
      sessionDurationInDays: 10,
      startDate: new Date('2021-09-01'),
      user: {
        id: 1,
        accessToken: '123'
      }
    });

    expect(true).toBe(true);
  });
});
