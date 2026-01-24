import { api } from '@/lib/api-client';
import type { User } from '@/types/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersKeys } from './get-users';

/**
 * Mutation hook for creating a user
 * Following bulletproof-react patterns with optimistic updates
 */

type CreateUserData = {
  name: string;
  email: string;
};

async function createUser(data: CreateUserData) {
  const response = await api.post<User>('/api/users', data);
  return response.data;
}

type UseCreateUserOptions = {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
};

export function useCreateUser(options: UseCreateUserOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error as Error);
    },
  });
}

