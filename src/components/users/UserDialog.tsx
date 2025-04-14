
import { useState } from "react";
import { User, availableRoles } from "@/types/user";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit: Partial<User>;
  isLoading: boolean;
  onSave: (user: Partial<User>, selectedRoles: string[]) => void;
}

export function UserDialog({ open, onOpenChange, userToEdit, isLoading, onSave }: UserDialogProps) {
  const [user, setUser] = useState<Partial<User>>(userToEdit);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(userToEdit.role || []);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSave = () => {
    onSave({ ...user, role: selectedRoles }, selectedRoles);
  };

  // Update local state when props change
  if (JSON.stringify(userToEdit) !== JSON.stringify(user)) {
    setUser(userToEdit);
    setSelectedRoles(userToEdit.role || []);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={user.name || ""}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
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
              value={user.email || ""}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
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
                value={user.password || ""}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
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
              value={user.status || "ativo"}
              onValueChange={(value) => setUser({ ...user, status: value as "ativo" | "inativo" })}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : user.id ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
