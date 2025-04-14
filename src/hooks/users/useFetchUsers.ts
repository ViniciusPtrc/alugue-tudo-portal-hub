
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
      
      // Primeira tentativa: usar a função RPC get_all_users
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_users');
        
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`Encontrados ${rpcData.length} usuários via RPC`);
        setUsers(rpcData as User[]);
        return;
      }

      if (rpcError) {
        console.error("Erro ao buscar usuários via RPC:", rpcError);
        
        // Segunda tentativa: buscar diretamente da tabela users
        console.log("Tentando buscar usuários diretamente da tabela...");
        const { data: tableData, error: tableError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!tableError && tableData && tableData.length > 0) {
          console.log(`Encontrados ${tableData.length} usuários via tabela`);
          setUsers(tableData as User[]);
          return;
        }
        
        if (tableError) {
          console.error("Erro ao buscar usuários via tabela:", tableError);
          toast.error("Erro ao carregar usuários: " + tableError.message);
        } else {
          console.log("Nenhum usuário encontrado na tabela");
        }
      } else {
        console.log("Nenhum usuário retornado pela RPC");
      }
      
      // Se chegou aqui, não conseguiu buscar usuários por nenhum método
      // Vamos verificar se o usuário atual existe pelo menos
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("Usuário atual encontrado:", user.id);
        
        // Terceira tentativa: Verificar se o próprio usuário atual existe na tabela
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!currentUserError && currentUserData) {
          console.log("Perfil do usuário atual encontrado na tabela users");
          setUsers([currentUserData as User]);
        } else {
          console.error("Erro ao buscar perfil do usuário atual:", currentUserError);
          setUsers([]);
        }
      } else {
        console.log("Nenhum usuário autenticado encontrado");
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
