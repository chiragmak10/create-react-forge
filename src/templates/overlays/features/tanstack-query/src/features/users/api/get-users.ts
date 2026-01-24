import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { User, PaginatedResponse } from '@/types/api';

/**
 * Example query hook following bulletproof-react patterns
 * Each feature has its own API folder with typed query hooks
 */

type GetUsersParams = {
  page?: number;
  limit?: number;
};

async function getUsers(params: GetUsersParams = {}) {
  const { page = 1, limit = 10 } = params;
  const response = await api.get<PaginatedResponse<User>>('/api/users', {
    page,
    limit,
  });
  return response.data;
}

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  });
}

// Query key factory for better organization
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: GetUsersParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

