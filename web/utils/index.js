export const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop(), 10);
};

export function throwError(message, errorObj) {
  if (errorObj) {
    throw errorObj;
  } else {
    throw new Error(message);
  }
}
