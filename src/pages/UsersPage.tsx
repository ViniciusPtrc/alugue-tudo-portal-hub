import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Edit,
  Eye,
  EyeOff,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";

// Tipo para usuários
interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string[];
  status: "ativo" | "inativo";
  created_at: string;
}

// Possiveis papéis/funções
const availableRoles = [
  { id: "admin", label: "Administrador" },
  { id: "rh", label: "RH" },
  { id: "financeiro", label: "Financeiro" },
  { id: "comercial", label: "Comercial" },
  { id: "operacional", label: "Operacional" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userToEdit, setUserToEdit] = useState<Partial<User>>({
    name: "",
    email: "",
    password: "",
    role: [],
    status: "ativo",
  });
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Logging user info for debugging
      console.info("User metadata:", user?.user_metadata);
      console.info("User roles:", user?.user_metadata?.role);
      
      // Check if user has admin role first - FIXED: Using 'admin' = ANY(role) instead of role ? 'admin'
      const userRoles = user?.user_metadata?.role || [];
      if (!userRoles.includes('admin')) {
        toast.error("Permissão negada para acessar usuários");
        return;
      }

      // Fetch the users using RPC
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
    } catch (error) {
      console.error("Exception fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
    setSelectedRoles([]);
    setShowPassword(false);
    setOpenUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit({ ...user, password: "" });
    setSelectedRoles(user.role);
    setShowPassword(false);
    setOpenUserDialog(true);
  };

  const handleSaveUser = async () => {
    if (!userToEdit.name || !userToEdit.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    if (!userToEdit.id && (!userToEdit.password || userToEdit.password === "")) {
      toast.error("Senha é obrigatória para novos usuários");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("Selecione pelo menos um papel/função");
      return;
    }

    try {
      setIsLoading(true);
      
      // For a new user
      if (!userToEdit.id) {
        // Using the RPC function to create a new user with proper password handling
        const { data, error } = await supabase.rpc('create_new_auth_user', {
          email: userToEdit.email,
          password: userToEdit.password,
          name: userToEdit.name,
          role: selectedRoles,
          status: userToEdit.status
        });

        if (error) {
          console.error("Error creating user:", error);
          toast.error("Erro ao criar usuário: " + error.message);
          return;
        }

        toast.success("Usuário adicionado com sucesso!");
      } else {
        // For updating an existing user
        const { error } = await supabase.rpc('update_user', {
          user_id: userToEdit.id,
          user_name: userToEdit.name,
          user_email: userToEdit.email,
          user_role: selectedRoles,
          user_status: userToEdit.status
        });

        if (error) {
          console.error("Error updating user:", error);
          toast.error("Erro ao atualizar usuário: " + error.message);
          return;
        }

        // If password was provided, update it separately
        if (userToEdit.password && userToEdit.password !== "") {
          const { error: passwordError } = await supabase.rpc('update_user_password', {
            user_id: userToEdit.id,
            new_password: userToEdit.password
          });
          
          if (passwordError) {
            console.error("Error updating password:", passwordError);
            toast.error("Erro ao atualizar senha: " + passwordError.message);
          } else {
            toast.success("Senha atualizada com sucesso!");
          }
        }

        toast.success("Usuário atualizado com sucesso!");
      }
      
      setOpenUserDialog(false);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      console.error("Exception saving user:", error);
      toast.error("Erro ao salvar usuário: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteUser = (id: string) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        setIsLoading(true);
        
        const { error } = await supabase.rpc('delete_user', {
          user_id: userToDelete
        });

        if (error) {
          console.error("Error deleting user:", error);
          toast.error("Erro ao excluir usuário: " + error.message);
          return;
        }

        toast.success("Usuário excluído com sucesso!");
        setOpenDeleteDialog(false);
        setUserToDelete(null);
        fetchUsers(); // Refresh the user list
      } catch (error: any) {
        console.error("Exception deleting user:", error);
        toast.error("Erro ao excluir usuário: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((current) =>
      current.includes(roleId)
        ? current.filter((r) => r !== roleId)
        : [...current, roleId]
    );
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar usuários..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex gap-1 items-center">
                  <Users className="h-3.5 w-3.5" /> 
                  {users.length} usuários
                </Badge>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papéis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Carregando usuários...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.role.map((role) => (
                              <Badge key={role} variant={role === "admin" ? "default" : "secondary"} className="text-xs">
                                {availableRoles.find(r => r.id === role)?.label || role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "ativo" ? "default" : "destructive"}>
                            {user.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => confirmDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para adicionar/editar usuário */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {userToEdit.id ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {userToEdit.id 
                ? "Edite as informações do usuário existente." 
                : "Preencha as informações para criar um novo usuário."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={userToEdit.name || ""}
                onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={userToEdit.email || ""}
                onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userToEdit.password || ""}
                  onChange={(e) => setUserToEdit({ ...userToEdit, password: e.target.value })}
                  className="pr-10"
                  placeholder={userToEdit.id ? "Mantenha vazio para não alterar" : "Digite a senha"}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={toggleShowPassword}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Papéis
              </Label>
              <div className="col-span-3 space-y-2">
                {availableRoles.map((role) => (
                  <div key={role.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="h-4 w-4"
                      disabled={isLoading}
                    />
                    <Label htmlFor={`role-${role.id}`}>
                      {role.id === "admin" && (
                        <span className="inline-flex items-center">
                          {role.label} <ShieldAlert className="h-4 w-4 ml-1 text-amber-500" />
                        </span>
                      )}
                      {role.id !== "admin" && role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={userToEdit.status || "ativo"}
                onValueChange={(value) => setUserToEdit({ ...userToEdit, status: value as "ativo" | "inativo" })}
                disabled={isLoading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Status do usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUserDialog(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={isLoading}>
              {isLoading ? "Salvando..." : userToEdit.id ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir usuário */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground" disabled={isLoading}>
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
