
export const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop(), 10);
};

export function throwError(message, errorObj) {
  throw new Error(message, errorObj ? {cause: errorObj} : null);
}

export function getTargetStringFromSemanticId(url, key) {
  const parts = url.split('/');
  const targetIdIndex = parts.indexOf(key) + 1;

  if (!targetIdIndex || targetIdIndex === 0) {
    throwError(`Could not find ${key} in ${url}`);
  }

  const targetIdWithParams = parts[targetIdIndex];
  // filter out any query parameters
  const [targetId] = targetIdWithParams.split('?');

  return targetId;
}
