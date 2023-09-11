import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

/**
 * A hook for querying your custom app data.
 * @desc A thin wrapper around useAuthenticatedFetch and react-query's useQuery.
 *
 * @param {Object} options - The options for your query. Accepts 3 keys:
 *
 * 1. url: The URL to query. E.g: /api/widgets/1`
 * 2. fetchInit: The init options for fetch.  See: https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
 * 3. reactQueryOptions: The options for `useQuery`. See: https://react-query.tanstack.com/reference/useQuery
 *
 * @returns Return value of useQuery.  See: https://react-query.tanstack.com/reference/useQuery.
 */
export const useAppQuery = ({ url, fetchInit = {}, reactQueryOptions }) => {
  const authenticatedFetch = useAuthenticatedFetch();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      const responseJson = await response.json();

      if (
        response.status === 500 ||
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        throw responseJson;
      }
      return responseJson;
    };
  }, [url, JSON.stringify(fetchInit)]);

  return useQuery(url, fetch, {
    ...reactQueryOptions,
    retryOnMount: true,
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: true
  });
};
