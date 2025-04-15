import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import { useUsersBase } from './useUsersBase';
import { useFetchUsers } from './useFetchUsers';

export const useCreateUser = () => {
  const { setIsLoading } = useUsersBase();
  const { fetchUsers } = useFetchUsers();

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

      // Verificar se o usuário atual tem papel de admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser || !currentUser.user_metadata || 
          !currentUser.user_metadata.role || 
          !Array.isArray(currentUser.user_metadata.role) || 
          !currentUser.user_metadata.role.includes('admin')) {
        console.error("Usuário não é administrador");
        toast.error("Permissão negada: apenas administradores podem criar usuários");
        return false;
      }
      
      // Usar o método alternativo diretamente para evitar problemas com a coluna password
      const currentSession = await supabase.auth.getSession();
      
      // Criar o usuário no auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role,
            status: user.status || 'ativo'
          },
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
      
      const userId = data.user.id;
      console.log("Usuário criado com sucesso no auth, ID:", userId);
      
      // Restaurar a sessão do admin
      if (currentSession.data.session) {
        console.log("Restaurando sessão do admin após signUp");
        await supabase.auth.setSession({
          access_token: currentSession.data.session.access_token,
          refresh_token: currentSession.data.session.refresh_token
        });
      }
      
      // Criar o perfil do usuário usando a função RPC create_user_profile em vez de inserir diretamente
      try {
        console.log("Criando perfil do usuário via RPC create_user_profile");
        
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || 'ativo'
        });
        
        if (profileError) {
          console.error("Erro ao criar perfil via RPC:", profileError);
          
          // Tentar inserir diretamente na tabela sem a coluna password
          console.log("Tentando método alternativo: inserção direta na tabela users");
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
            console.error("Erro ao inserir na tabela users:", insertError);
            toast.error("Erro ao criar perfil: " + insertError.message);
            return false;
          }
        }
        
        console.log("Perfil criado com sucesso");
        toast.success("Usuário adicionado com sucesso!");
        
        // Recarregar a lista de usuários
        await fetchUsers();
        return true;
      } catch (insertError: any) {
        console.error("Exceção ao criar perfil:", insertError);
        toast.error("Erro ao criar perfil: " + insertError.message);
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

  return {
    createUser,
  };
};
