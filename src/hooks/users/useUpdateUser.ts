
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import { useUsersBase } from './useUsersBase';
import { useFetchUsers } from './useFetchUsers';

export const useUpdateUser = () => {
  const { setIsLoading } = useUsersBase();
  const { fetchUsers } = useFetchUsers();

  const updateUser = async (user: Partial<User>) => {
    try {
      setIsLoading(true);
      
      if (!user.id || !user.name || !user.email || !user.role || user.role.length === 0) {
        toast.error("Todos os campos obrigatórios devem ser preenchidos");
        return false;
      }
      
      const { error } = await supabase.rpc('update_user', {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        user_role: user.role,
        user_status: user.status
      });

      if (error) {
        console.error("Error updating user:", error);
        toast.error("Erro ao atualizar usuário: " + error.message);
        return false;
      }

      if (user.password && user.password !== "") {
        const { error: passwordError } = await supabase.rpc('update_user_password', {
          user_id: user.id,
          new_password: user.password
        });
        
        if (passwordError) {
          console.error("Error updating password:", passwordError);
          toast.error("Erro ao atualizar senha: " + passwordError.message);
        } else {
          toast.success("Senha atualizada com sucesso!");
        }
      }

      toast.success("Usuário atualizado com sucesso!");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Exception updating user:", error);
      toast.error("Erro ao atualizar usuário: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUser,
  };
};
