import { createSalesSessionCronJob } from './createSalesSessionCronJob';
import UseCases from '../sales-session/use-cases/index.js';
import { query } from '../../database/connect.js';

describe('CreateSalesSession Cron job', () => {
  test('cron job', async () => {
    await query('DELETE FROM sales_sessions');

    await UseCases.createSalesSessionUseCase({
      startDate: new Date('2021-09-01'),
      sessionDurationInDays: 10,
      partiallySoldEnabled: true,
      user: {
        id: 1,
        accessToken: 'access_token'
      },
      session: {
        id: 'offline_hassanstroe.myshopify.com',
        accessToken: 'shpua_1b8e782b23f688554d7f078933715395',
        shop: 'hassanstroe.myshopify.com',
        state: '301338157897533',
        scope: 'write_products,write_draft_orders,write_inventory',
        isOnline: false
      }
    });
    await createSalesSessionCronJob();

    const result = await query(
      'SELECT * FROM sales_sessions ORDER BY end_date ASC'
    );
    expect(result.rows.length).toBe(2);
    expect(
      new Date(result.rows.find((row) => row.isActive).startDate).toISOString()
    ).toBe('2021-09-10T18:00:00.000Z');

    expect(
      new Date(result.rows.find((row) => row.isActive).endDate).toISOString()
    ).toBe('2021-09-20T18:00:00.000Z');
  }, 10000000);
});
