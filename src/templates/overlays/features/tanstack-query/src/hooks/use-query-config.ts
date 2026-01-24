import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to access and manage the query client
 * Following bulletproof-react patterns
 */
export function useQueryConfig() {
  const queryClient = useQueryClient();

  const invalidateQueries = (queryKey: string[]) => {
    return queryClient.invalidateQueries({ queryKey });
  };

  const prefetchQuery = <T>(
    queryKey: string[],
    queryFn: () => Promise<T>
  ) => {
    return queryClient.prefetchQuery({ queryKey, queryFn });
  };

  const setQueryData = <T>(queryKey: string[], data: T) => {
    return queryClient.setQueryData(queryKey, data);
  };

  const getQueryData = <T>(queryKey: string[]): T | undefined => {
    return queryClient.getQueryData(queryKey);
  };

  const removeQueries = (queryKey: string[]) => {
    return queryClient.removeQueries({ queryKey });
  };

  return {
    queryClient,
    invalidateQueries,
    prefetchQuery,
    setQueryData,
    getQueryData,
    removeQueries,
  };
}

