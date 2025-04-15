
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
      
      // Tentativa principal: usar create_new_auth_user function - mantém a sessão atual
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
        toast.error("Erro ao criar usuário: " + createError.message);
        
        // Se o erro mencionar "password" da tabela "users", é porque estamos tentando
        // salvar a senha no lugar errado
        if (createError.message.includes('password') && createError.message.includes('users')) {
          console.log("Tentando método alternativo devido ao erro de coluna password");
          
          // Vamos tentar criar o usuário diretamente no auth sem tocar na tabela users
          const alternativeCreate = await createUserWithoutPasswordColumn(user);
          return alternativeCreate;
        }
        
        return false;
      }
      
      return false;
    } catch (error: any) {
      console.error("Exceção ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Método alternativo para criar usuário sem depender da coluna password na tabela users
  const createUserWithoutPasswordColumn = async (user: Partial<User>) => {
    try {
      console.log("Usando método alternativo para criar usuário");
      
      // Capturar a sessão atual antes do signUp
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
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
        toast.error("Sua sessão expirou durante a criação do usuário. Por favor, faça login novamente.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return false;
      }
      
      // Criar o perfil do usuário sem a coluna password
      try {
        console.log("Criando perfil do usuário na tabela users sem a coluna password");
        
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
        } else {
          console.log("Perfil criado com sucesso");
          toast.success("Usuário adicionado com sucesso!");
          await fetchUsers();
          return true;
        }
      } catch (insertError: any) {
        console.error("Exceção ao inserir diretamente:", insertError);
        toast.error("Erro ao criar perfil: " + insertError.message);
        return false;
      }
    } catch (error: any) {
      console.error("Exceção no método alternativo:", error);
      toast.error("Erro ao salvar usuário: " + error.message);
      return false;
    }
  };

  return {
    createUser,
  };
};
