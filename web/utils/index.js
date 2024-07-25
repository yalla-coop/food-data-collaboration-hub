export const convertShopifyGraphQLIdToNumber = (id) => {
  if (!id) return null;
  if (typeof id === 'number') return id;
  return parseInt(id.split('/').pop(), 10);
};

export function getShopifyIdSubstring(url) {
  return url.substring(url.lastIndexOf('/') + 1);
}

export function throwError(message, errorObj) {
  if (errorObj) {
    throw errorObj;
  } else {
    throw new Error(message);
  }
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

export async function executeGraphQLQuery(gqlClient, QUERY, variables) {
  const response = await gqlClient.request(QUERY, {
    variables
  });

  if (response.errors) {
    throw new Error(JSON.stringify(response.errors));
  }

  return response.data;
}
