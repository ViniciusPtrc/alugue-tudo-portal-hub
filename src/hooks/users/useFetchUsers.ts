
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
      
      // Verify user roles more robustly
      const userRoles = currentUser?.user_metadata?.role || [];
      const isAdmin = Array.isArray(userRoles) && userRoles.includes('admin');
      
      if (!isAdmin) {
        console.error("Usuário não é administrador");
        toast.error("Permissão negada: apenas administradores podem listar usuários");
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      console.log("User is admin, fetching users...");
      
      // Chamando a função RPC get_all_users criada com SECURITY DEFINER
      const { data: users, error } = await supabase
        .rpc('get_all_users');
      
      console.log("RPC response:", { users, error });
        
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao carregar usuários: " + error.message);
        setUsers([]);
        return;
      }
      
      if (users && users.length > 0) {
        console.log(`Encontrados ${users.length} usuários:`, users);
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
