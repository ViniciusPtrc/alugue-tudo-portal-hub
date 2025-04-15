
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import { useUsersBase } from './useUsersBase';

export const useFetchUsers = () => {
  const { setUsers, setIsLoading } = useUsersBase();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Iniciando busca de usuários...");
      
      // Verificar se o usuário atual tem papel de admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser || !currentUser.user_metadata || 
          !currentUser.user_metadata.role || 
          !Array.isArray(currentUser.user_metadata.role) || 
          !currentUser.user_metadata.role.includes('admin')) {
        console.error("Usuário não é administrador");
        toast.error("Permissão negada: apenas administradores podem listar usuários");
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      // Chamando a função RPC get_all_users criada com SECURITY DEFINER
      const { data: users, error } = await supabase
        .rpc('get_all_users');
        
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao carregar usuários: " + error.message);
        setUsers([]);
        return;
      }
      
      if (users && users.length > 0) {
        console.log(`Encontrados ${users.length} usuários`);
        setUsers(users as User[]);
      } else {
        console.log("Nenhum usuário encontrado");
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Exceção ao buscar usuários:", error);
      toast.error("Erro ao carregar usuários: " + (error.message || "Erro desconhecido"));
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchUsers,
  };
};
