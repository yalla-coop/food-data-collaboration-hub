export const createHubCustomerDetails = (hubString, userObject) => ({
  first_name: hubString?.split('.myshopify')[0] || userObject?.name || '',
  last_name: '',
  email:
    userObject?.email ||
    `${hubString?.split('.myshopify')?.[0]}@dfc-hub.org` ||
    ''
});
