
import { useState } from "react";
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
  DialogFooter 
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

// Tipo para usuários
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string[];
  status: "ativo" | "inativo";
  created_at: string;
}

// Usuarios de exemplo
const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@aluguetudo.com",
    password: "senha123",
    role: ["admin"],
    status: "ativo",
    created_at: "2025-01-15",
  },
  {
    id: "2",
    name: "Maria Souza",
    email: "maria.souza@aluguetudo.com",
    password: "senha456",
    role: ["rh"],
    status: "ativo",
    created_at: "2025-02-10",
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@aluguetudo.com",
    password: "senha789",
    role: ["financeiro"],
    status: "ativo",
    created_at: "2025-02-25",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana.oliveira@aluguetudo.com",
    password: "senha321",
    role: ["comercial"],
    status: "inativo",
    created_at: "2025-03-05",
  },
  {
    id: "5",
    name: "Carlos Ferreira",
    email: "carlos.ferreira@aluguetudo.com",
    password: "senha654",
    role: ["operacional"],
    status: "ativo",
    created_at: "2025-03-20",
  },
];

// Possiveis papéis/funções
const availableRoles = [
  { id: "admin", label: "Administrador" },
  { id: "rh", label: "RH" },
  { id: "financeiro", label: "Financeiro" },
  { id: "comercial", label: "Comercial" },
  { id: "operacional", label: "Operacional" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
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
    setUserToEdit({...user, password: "••••••••"}); // Mascarando a senha por segurança
    setSelectedRoles(user.role);
    setShowPassword(false);
    setOpenUserDialog(true);
  };

  const handleSaveUser = () => {
    if (!userToEdit.name || !userToEdit.email) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }

    if (!userToEdit.id && (!userToEdit.password || userToEdit.password === "••••••••")) {
      toast.error("Senha é obrigatória para novos usuários");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("Selecione pelo menos um papel/função");
      return;
    }

    // Para um novo usuário
    if (!userToEdit.id) {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: userToEdit.name,
        email: userToEdit.email,
        password: userToEdit.password || "",
        role: selectedRoles,
        status: userToEdit.status as "ativo" | "inativo",
        created_at: new Date().toISOString().split("T")[0],
      };
      setUsers([...users, newUser]);
      toast.success("Usuário adicionado com sucesso!");
    } else {
      // Para edição de usuário existente
      setUsers(
        users.map((user) =>
          user.id === userToEdit.id
            ? {
                ...user,
                name: userToEdit.name || user.name,
                email: userToEdit.email || user.email,
                password: userToEdit.password === "••••••••" ? user.password : (userToEdit.password || user.password),
                role: selectedRoles,
                status: userToEdit.status as "ativo" | "inativo" || user.status,
              }
            : user
        )
      );
      toast.success("Usuário atualizado com sucesso!");
    }
    setOpenUserDialog(false);
  };

  const confirmDeleteUser = (id: string) => {
    setUserToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter((user) => user.id !== userToDelete));
      toast.success("Usuário excluído com sucesso!");
      setOpenDeleteDialog(false);
      setUserToDelete(null);
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
      <Header user={mockUsers[0]} />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
              <p className="text-muted-foreground">
                Adicione, edite e remova usuários do sistema.
              </p>
            </div>
            <Button onClick={handleAddUser}>
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
                  {filteredUsers.length === 0 ? (
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={toggleShowPassword}
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
            <Button variant="outline" onClick={() => setOpenUserDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>{userToEdit.id ? "Atualizar" : "Adicionar"}</Button>
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
