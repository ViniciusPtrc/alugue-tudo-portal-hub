
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
      
      // 1. Cadastro do usuário no sistema de autenticação
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

      if (!data.user) {
        console.error("Usuário criado, mas objeto user não foi retornado");
        toast.error("Erro ao criar perfil de usuário: dados incompletos");
        return false;
      }

      console.log("Usuário criado com sucesso, ID:", data.user.id);
      
      // Vamos tentar várias abordagens diferentes para garantir que o perfil seja criado
      let profileCreated = false;
      
      // 2. Primeira tentativa: Inserção direta
      try {
        console.log("Tentando inserir diretamente na tabela users");
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
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
      
      // 3. Segunda tentativa: criar o perfil usando a função create_user_profile
      if (!profileCreated) {
        try {
          console.log("Tentando criar perfil com dados:", {
            user_id: data.user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || 'ativo'
          });
            
          const { error: profileError } = await supabase.rpc('create_user_profile', {
            user_id: data.user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || 'ativo'
          });

          if (profileError) {
            console.error("Erro ao criar perfil via RPC:", profileError);
          } else {
            console.log("Perfil criado com sucesso via RPC");
            profileCreated = true;
          }
        } catch (profileError: any) {
          console.error("Exceção ao criar perfil via RPC:", profileError);
        }
      }
      
      // 4. Terceira tentativa: criar perfil via create_new_auth_user
      if (!profileCreated) {
        try {
          console.log("Tentando criar perfil completo via create_new_auth_user");
          const { error: newUserError } = await supabase.rpc('create_new_auth_user', {
            email: user.email,
            password: user.password || '',
            name: user.name,
            role: user.role,
            status: user.status || 'ativo'
          });
          
          if (newUserError) {
            console.error("Erro ao criar usuário via create_new_auth_user:", newUserError);
          } else {
            console.log("Usuário criado com sucesso via create_new_auth_user");
            profileCreated = true;
          }
        } catch (createNewError: any) {
          console.error("Exceção ao criar usuário via create_new_auth_user:", createNewError);
        }
      }

      // 5. Verificar se o perfil foi criado com sucesso
      if (profileCreated) {
        toast.success("Usuário adicionado com sucesso!");
        await fetchUsers();
        return true;
      } else {
        toast.error("Usuário foi criado, mas o perfil não pôde ser completado. Por favor, contate o administrador.");
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
      
      const { error } = await supabase.rpc('delete_user', {
        user_id: userId
      });

      if (error) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Erro ao excluir usuário: " + error.message);
        return false;
      }

      toast.success("Usuário excluído com sucesso!");
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error("Exceção ao excluir usuário:", error);
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
