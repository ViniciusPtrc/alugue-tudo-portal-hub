
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { User } from "@/types/user";
import { useUsers } from "@/hooks/useUsers";
import { UserDialog } from "@/components/users/UserDialog";
import { DeleteConfirmDialog } from "@/components/users/DeleteConfirmDialog";
import { UserTable } from "@/components/users/UserTable";
import { UserSearch } from "@/components/users/UserSearch";
import { supabase } from "@/integrations/supabase/client";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Partial<User>>({
    name: "",
    email: "",
    password: "",
    role: [],
    status: "ativo",
  });
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const { users, isLoading, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  
  useEffect(() => {
    // Log user metadata and permissions
    console.log("User metadata:", user?.user_metadata);
    const userRoles = user?.user_metadata?.role || [];
    console.log("User roles:", userRoles);
    const isAdmin = userRoles.includes('admin');
    console.log("Is admin:", isAdmin);
    
    // Check if user has admin role
    if (!isAdmin) {
      toast.error("Permissão negada para acessar usuários");
      return;
    }
    
    // Verificar estado atual do banco de dados
    const checkDatabaseState = async () => {
      try {
        // Verificar se já existem usuários no sistema
        const { data: dbUsers, error: userError } = await supabase.from('users').select('*');
        if (userError) {
          console.error("Erro ao verificar usuários:", userError);
        } else {
          console.log(`Encontrados ${dbUsers?.length || 0} usuários na tabela public.users`);
        }
      } catch (e) {
        console.error("Erro ao verificar estado do banco:", e);
      }
    };
    
    checkDatabaseState();
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddUser = () => {
    setUserToEdit({
      name: "",
      email: "",
      password: "",
      role: [],
      status: "ativo",
    });
    setOpenUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit({ ...user, password: "" });
    setOpenUserDialog(true);
  };

  const handleSaveUser = async (user: Partial<User>, selectedRoles: string[]) => {
    if (!user.name || !user.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    if (!user.id && (!user.password || user.password === "")) {
      toast.error("Senha é obrigatória para novos usuários");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("Selecione pelo menos um papel/função");
      return;
    }

    // Update or create user
    const success = user.id 
      ? await updateUser({ ...user, role: selectedRoles })
      : await createUser({ ...user, role: selectedRoles });
    
    if (success) {
      setOpenUserDialog(false);
      // Atualizar a lista após a criação/atualização
      await fetchUsers();
    }
  };

  const confirmDeleteUser = (id: string) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete);
      if (success) {
        setOpenDeleteDialog(false);
        setUserToDelete(null);
        // Atualizar a lista após a exclusão
        await fetchUsers();
      }
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
              <p className="text-muted-foreground">
                Adicione, edite e remova usuários do sistema.
              </p>
            </div>
            <Button onClick={handleAddUser} disabled={isLoading}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <UserSearch 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              totalUsers={users.length} 
            />
            
            <UserTable 
              users={users}
              filteredUsers={filteredUsers}
              isLoading={isLoading}
              onEdit={handleEditUser}
              onDelete={confirmDeleteUser}
            />
          </div>
        </div>
      </div>

      {/* User form dialog */}
      <UserDialog 
        open={openUserDialog}
        onOpenChange={setOpenUserDialog}
        userToEdit={userToEdit}
        isLoading={isLoading}
        onSave={handleSaveUser}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog 
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDeleteUser}
        isLoading={isLoading}
      />
    </div>
  );
}
