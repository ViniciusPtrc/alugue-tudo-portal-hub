
import { useUsersBase } from './useUsersBase';
import { useFetchUsers } from './useFetchUsers';
import { useCreateUser } from './useCreateUser';
import { useUpdateUser } from './useUpdateUser';
import { useDeleteUser } from './useDeleteUser';

export const useUsers = () => {
  const { users, isLoading } = useUsersBase();
  const { fetchUsers } = useFetchUsers();
  const { createUser } = useCreateUser();
  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser();

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};
