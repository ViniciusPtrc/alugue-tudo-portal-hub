
import { useEffect } from "react";
import { Header } from "@/components/header";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { UserDialog } from "@/components/users/UserDialog";
import { DeleteConfirmDialog } from "@/components/users/DeleteConfirmDialog";
import { UsersHeader } from "@/components/users/UsersHeader";
import { UsersContent } from "@/components/users/UsersContent";
import { useUsersPage } from "@/hooks/users/useUsersPage";
import { useUserValidation } from "@/hooks/users/useUserValidation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

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

  // Verificar se o usuário é admin
  const userRoles = user?.user_metadata?.role || [];
  const isAdmin = Array.isArray(userRoles) && userRoles.includes('admin');

  useEffect(() => {
    console.log("User metadata:", user?.user_metadata);
    console.log("User roles:", userRoles);
    console.log("Is admin:", isAdmin);
    
    if (!isAdmin) {
      toast.error("Permissão negada para acessar usuários");
      return;
    }
    
    const loadUsers = async () => {
      try {
        console.log("Iniciando carregamento de usuários");
        await fetchUsers();
        console.log("Usuários carregados com sucesso");
        console.log("Users state after fetching:", users);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast.error("Falha ao carregar lista de usuários");
      }
    };
    
    loadUsers();
  }, [user, fetchUsers, isAdmin]);

  // Add this for debugging
  useEffect(() => {
    console.log("Current users in state:", users);
    console.log("Filtered users:", filteredUsers);
    console.log("Is loading:", isLoading);
  }, [users, filteredUsers, isLoading]);

  const handleUserSave = async (user, selectedRoles) => {
    if (!validateUserForm(user, selectedRoles)) {
      return;
    }
    
    const success = await handleSaveUser(user, selectedRoles);
    
    if (success) {
      showSuccessToast(user.id ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!");
      // Recarregar a lista após salvar com sucesso
      fetchUsers();
    }
  };

  const handleUserDelete = async () => {
    const success = await handleDeleteUser();
    
    if (success) {
      showSuccessToast("Usuário excluído com sucesso!");
      // Recarregar a lista após excluir com sucesso
      fetchUsers();
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
          {!isAdmin && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Acesso negado</AlertTitle>
              <AlertDescription>
                Apenas administradores podem acessar esta página.
              </AlertDescription>
            </Alert>
          )}

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
