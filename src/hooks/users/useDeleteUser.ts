
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUsersBase } from './useUsersBase';
import { useFetchUsers } from './useFetchUsers';

export const useDeleteUser = () => {
  const { users, setUsers, setIsLoading } = useUsersBase();
  const { fetchUsers } = useFetchUsers();

  const deleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("Usuário não autenticado");
        return false;
      }
      
      console.log("Iniciando exclusão do usuário:", userId);
      
      // Immediately update UI state to improve responsiveness
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      const { error } = await supabase.rpc('delete_user', {
        user_id: userId
      });

      if (error) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Erro ao excluir usuário: " + error.message);
        
        // If there was an error, revert the optimistic update by fetching again
        await fetchUsers();
        return false;
      }
      
      console.log("Usuário excluído com sucesso:", userId);
      return true;
    } catch (error: any) {
      console.error("Exceção ao excluir usuário:", error);
      toast.error("Erro ao excluir usuário: " + (error.message || "Erro desconhecido"));
      
      // If there was an exception, revert the optimistic update by fetching again
      await fetchUsers();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteUser,
  };
};
