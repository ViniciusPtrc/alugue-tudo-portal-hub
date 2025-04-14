
import { useState } from 'react';
import { User } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the users using RPC with the corrected admin verification
      const { data, error } = await supabase
        .rpc('get_all_users');
        
      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Erro ao carregar usuários: " + error.message);
        return;
      }

      if (data) {
        setUsers(data as User[]);
      }
    } catch (error: any) {
      console.error("Exception fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (user: Partial<User>) => {
    try {
      setIsLoading(true);
      
      if (!user.name || !user.email || !user.password || !user.role || user.role.length === 0) {
        toast.error("Todos os campos obrigatórios devem ser preenchidos");
        return false;
      }
      
      // Primeiro, criar usuário usando signUp do Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role,
            status: user.status || 'ativo'
          }
        }
      });

      if (signUpError) {
        console.error("Erro ao criar usuário:", signUpError);
        toast.error("Erro ao criar usuário: " + signUpError.message);
        return false;
      }

      // Se o usuário foi criado com sucesso, adicionar perfil complementar
      if (data.user) {
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: data.user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || 'ativo'
        });

        if (profileError) {
          console.error("Erro ao criar perfil de usuário:", profileError);
          toast.error("Erro ao criar perfil: " + profileError.message);
          return false;
        }
      }

      toast.success("Usuário adicionado com sucesso!");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Exceção ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (user: Partial<User>) => {
    try {
      setIsLoading(true);
      
      if (!user.id || !user.name || !user.email || !user.role || user.role.length === 0) {
        toast.error("Todos os campos obrigatórios devem ser preenchidos");
        return false;
      }
      
      // Using the RPC function with corrected admin verification
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

      // If password was provided, update it separately with corrected admin verification
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

  const deleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Using the RPC function with corrected admin verification
      const { error } = await supabase.rpc('delete_user', {
        user_id: userId
      });

      if (error) {
        console.error("Error deleting user:", error);
        toast.error("Erro ao excluir usuário: " + error.message);
        return false;
      }

      toast.success("Usuário excluído com sucesso!");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Exception deleting user:", error);
      toast.error("Erro ao excluir usuário: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};
