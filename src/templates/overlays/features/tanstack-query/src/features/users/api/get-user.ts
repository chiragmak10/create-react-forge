import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { User } from '@/types/api';
import { usersKeys } from './get-users';

/**
 * Query hook for fetching a single user
 */

async function getUser(userId: string) {
  const response = await api.get<User>(`/api/users/${userId}`);
  return response.data;
}

type UseUserOptions = {
  userId: string;
  enabled?: boolean;
};

export function useUser({ userId, enabled = true }: UseUserOptions) {
  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => getUser(userId),
    enabled,
  });
}

