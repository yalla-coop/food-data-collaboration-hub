export const createHubCustomerDetails = (hubString) => ({
  first_name: hubString?.split('.myshopify')[0] || '',
  last_name: '',
  email: `${hubString?.split('.myshopify')?.[0]}@dfc-hub.org` || ''
});
