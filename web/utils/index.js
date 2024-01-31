import * as qs from 'qs';

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

export function getQueryParamsObjFromUrl(url) {
  const queryString = url.split('?')[1];

  if (!queryString) {
    return {};
  }
  const decodedQueryString = decodeURIComponent(queryString);

  const parsedData = qs.parse(decodedQueryString);

  return parsedData;
}
