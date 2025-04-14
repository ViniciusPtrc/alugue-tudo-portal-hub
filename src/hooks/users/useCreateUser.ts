
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
      
      // Segunda tentativa: signUp sem login automático
      let userId = null;
      let profileCreated = false;
      
      // Capturar a sessão atual antes do signUp
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
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
      
      // Restaurar a sessão do admin usando a sessão que capturamos antes do signUp
      if (currentSession) {
        console.log("Restaurando sessão do admin após signUp");
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token
        });
      } else {
        console.warn("Sessão anterior não encontrada, usuário administrador pode ter sido deslogado");
      }
      
      // Verificar se a sessão do admin foi restaurada
      const { data: { session: restoredSession } } = await supabase.auth.getSession();
      
      if (!restoredSession) {
        console.warn("Sessão do admin perdida após signUp. Tentando restaurar...");
        
        // Se chegarmos aqui, o admin foi deslogado. Mostrar toast com instruções para login
        toast.error("Sua sessão expirou durante a criação do usuário. Por favor, faça login novamente.");
        
        // Redirecionar para login após um breve atraso para o toast ser visualizado
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
        return false;
      }
      
      // Criar o perfil do usuário usando a função create_user_profile
      try {
        console.log("Criando perfil do usuário via função create_user_profile");
        
        const { error: profileError } = await supabase.rpc('create_user_profile', {
          user_id: userId,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || 'ativo'
        });

        if (profileError) {
          console.error("Erro ao criar perfil via RPC:", profileError);
          
          // Tentativa alternativa: inserir diretamente na tabela users
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
        } else {
          console.log("Perfil criado com sucesso via RPC create_user_profile");
          profileCreated = true;
        }
      } catch (profileError: any) {
        console.error("Exceção ao criar perfil via RPC:", profileError);
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

  return {
    createUser,
  };
};
