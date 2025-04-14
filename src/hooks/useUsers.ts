
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
      
      console.log("Iniciando criação de usuário:", { 
        email: user.email, 
        name: user.name, 
        role: user.role
      });
      
      // Primeira tentativa: usar create_new_auth_user function - mantém a sessão atual
      const { data: newUser, error: createError } = await supabase.rpc('create_new_auth_user', {
        email: user.email,
        password: user.password || '',
        name: user.name,
        role: user.role,
        status: user.status || 'ativo'
      });
      
      if (!createError && newUser) {
        console.log("Usuário criado com sucesso via create_new_auth_user", newUser);
        toast.success("Usuário adicionado com sucesso!");
        await fetchUsers();
        return true;
      }
      
      if (createError) {
        console.error("Erro ao criar usuário via RPC:", createError);
      }
      
      // Segunda tentativa: signUp com emailRedirectTo para evitar login automático
      let profileCreated = false;
      let userId = null;
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role,
            status: user.status || 'ativo'
          },
          // Crucial: isso evita o login automático após o cadastro
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (signUpError) {
        console.error("Erro ao criar usuário:", signUpError);
        toast.error("Erro ao criar usuário: " + signUpError.message);
        return false;
      }

      if (!data.user) {
        console.error("Usuário criado, mas objeto user não foi retornado");
        toast.error("Erro ao criar perfil de usuário: dados incompletos");
        return false;
      }
      
      userId = data.user.id;
      console.log("Usuário criado com sucesso no auth, ID:", userId);
      
      // Restaura a sessão do admin imediatamente para evitar logout
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.warn("Sessão do admin perdida após signUp. Tentando restaurar...");
        
        // Se chegarmos aqui, o admin foi deslogado. Mostrar toast com instruções para login
        toast.error("Sua sessão expirou durante a criação do usuário. Por favor, faça login novamente.");
        
        // Redirecionar para login após um breve atraso para o toast ser visualizado
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
        return false;
      }
      
      // Tenta inserir o perfil do usuário na tabela users
      try {
        console.log("Tentando inserir dados no perfil do usuário via tabela users");
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || 'ativo'
          });
          
        if (insertError) {
          console.error("Erro ao inserir diretamente na tabela users:", insertError);
        } else {
          console.log("Perfil criado com sucesso via insert direto");
          profileCreated = true;
        }
      } catch (insertError: any) {
        console.error("Exceção ao inserir diretamente:", insertError);
      }
      
      // Se não conseguir inserir diretamente, tenta com a função RPC
      if (!profileCreated) {
        try {
          console.log("Tentando criar perfil com função create_user_profile");
          
          const { error: profileError } = await supabase.rpc('create_user_profile', {
            user_id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || 'ativo'
          });

          if (profileError) {
            console.error("Erro ao criar perfil via RPC:", profileError);
          } else {
            console.log("Perfil criado com sucesso via RPC create_user_profile");
            profileCreated = true;
          }
        } catch (profileError: any) {
          console.error("Exceção ao criar perfil via RPC:", profileError);
        }
      }
      
      // Verificação final do perfil
      if (profileCreated) {
        toast.success("Usuário adicionado com sucesso!");
        await fetchUsers();
        return true;
      } else {
        toast.error("Usuário foi criado, mas o perfil pode não estar completo.");
        return false;
      }
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
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};
