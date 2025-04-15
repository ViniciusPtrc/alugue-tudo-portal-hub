
import { useEffect, useState } from "react";
import { User, availableRoles } from "@/types/user";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  const [saving, setSaving] = useState(false);

  // Sincroniza o estado local quando as props mudam
  useEffect(() => {
    if (open) {
      setUser(userToEdit);
      setSelectedRoles(userToEdit.role || []);
      setSaving(false);
    }
  }, [userToEdit, open]);

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

  const validateForm = () => {
    if (!user.name || user.name.trim() === "") {
      toast.error("O nome é obrigatório");
      return false;
    }

    if (!user.email || user.email.trim() === "") {
      toast.error("O e-mail é obrigatório");
      return false;
    }

    if (!user.id && (!user.password || user.password.trim() === "")) {
      toast.error("A senha é obrigatória para novos usuários");
      return false;
    }

    if (selectedRoles.length === 0) {
      toast.error("Selecione pelo menos um papel/função");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      await onSave({ ...user, role: selectedRoles }, selectedRoles);
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Ocorreu um erro ao salvar o usuário. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user.id ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {user.id 
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
              disabled={isLoading || saving}
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
              disabled={isLoading || saving}
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
                placeholder={user.id ? "Mantenha vazio para não alterar" : "Digite a senha"}
                disabled={isLoading || saving}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={toggleShowPassword}
                disabled={isLoading || saving}
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
                    disabled={isLoading || saving}
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
              disabled={isLoading || saving}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading || saving}>
            {isLoading || saving ? "Salvando..." : user.id ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
