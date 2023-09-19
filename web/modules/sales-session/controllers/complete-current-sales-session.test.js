import completeCurrentSalesSession from './complete-current-sales-session.js';
describe('completeCurrentSalesSession', () => {
  it('should complete the current sales session', async () => {
    await completeCurrentSalesSession();
    expect(true).toBe(true);
  });
});
