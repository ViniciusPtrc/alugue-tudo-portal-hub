
import { useState } from 'react';
import { User } from '@/types/user';

export const useUsersBase = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to update users list optimistically
  const updateUsersList = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  return {
    users,
    setUsers,
    isLoading,
    setIsLoading,
    updateUsersList,
  };
};
