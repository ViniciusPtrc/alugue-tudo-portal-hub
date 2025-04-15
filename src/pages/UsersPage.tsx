
import { useEffect } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserDialog } from "@/components/users/UserDialog";
import { DeleteConfirmDialog } from "@/components/users/DeleteConfirmDialog";
import { UsersHeader } from "@/components/users/UsersHeader";
import { UsersContent } from "@/components/users/UsersContent";
import { useUsersPage } from "@/hooks/users/useUsersPage";
import { useUserValidation } from "@/hooks/users/useUserValidation";

export default function UsersPage() {
  const { user } = useAuth();
  const { validateUserForm, showSuccessToast } = useUserValidation();
  
  const {
    searchQuery,
    setSearchQuery,
    openUserDialog,
    setOpenUserDialog,
    openDeleteDialog,
    setOpenDeleteDialog,
    userToEdit,
    isDeleting,
    users,
    filteredUsers,
    isLoading,
    fetchUsers,
    handleAddUser,
    handleEditUser,
    handleSaveUser,
    confirmDeleteUser,
    handleDeleteUser
  } = useUsersPage();

  useEffect(() => {
    console.log("User metadata:", user?.user_metadata);
    const userRoles = user?.user_metadata?.role || [];
    console.log("User roles:", userRoles);
    const isAdmin = userRoles.includes('admin');
    console.log("Is admin:", isAdmin);
    
    if (!isAdmin) {
      toast.error("Permissão negada para acessar usuários");
      return;
    }
    
    const checkDatabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
          console.error("Erro ao conectar ao banco de dados:", error);
          toast.error("Problemas de conexão com o banco de dados");
        } else {
          console.log("Conexão com o banco de dados estabelecida");
          loadUsers();
        }
      } catch (e) {
        console.error("Exceção ao verificar conexão:", e);
        toast.error("Erro ao estabelecer conexão com o banco de dados");
      }
    };
    
    const loadUsers = async () => {
      try {
        console.log("Iniciando carregamento de usuários");
        await fetchUsers();
        console.log("Usuários carregados com sucesso");
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast.error("Falha ao carregar lista de usuários");
      }
    };
    
    checkDatabaseConnection();
  }, [user, fetchUsers]);

  const handleUserSave = async (user, selectedRoles) => {
    if (!validateUserForm(user, selectedRoles)) {
      return;
    }
    
    const success = await handleSaveUser(user, selectedRoles);
    
    if (success) {
      showSuccessToast(user.id ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!");
    }
  };

  const handleUserDelete = async () => {
    const success = await handleDeleteUser();
    
    if (success) {
      showSuccessToast("Usuário excluído com sucesso!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={{
        name: user?.user_metadata?.name || "",
        email: user?.email || "",
        role: user?.user_metadata?.role || []
      }} />
      
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <UsersHeader 
            onAddUser={handleAddUser} 
            isLoading={isLoading} 
          />

          <UsersContent 
            users={users}
            filteredUsers={filteredUsers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onEditUser={handleEditUser}
            onDeleteUser={confirmDeleteUser}
          />
        </div>
      </div>

      <UserDialog 
        open={openUserDialog}
        onOpenChange={setOpenUserDialog}
        userToEdit={userToEdit}
        isLoading={isLoading}
        onSave={handleUserSave}
      />

      <DeleteConfirmDialog 
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleUserDelete}
        isLoading={isDeleting || isLoading}
      />
    </div>
  );
}
