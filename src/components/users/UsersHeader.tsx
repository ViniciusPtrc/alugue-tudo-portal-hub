
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UsersHeaderProps {
  onAddUser: () => void;
  isLoading: boolean;
}

export function UsersHeader({ onAddUser, isLoading }: UsersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">
          Adicione, edite e remova usuários do sistema.
        </p>
      </div>
      <Button onClick={onAddUser} disabled={isLoading}>
        <UserPlus className="h-4 w-4 mr-2" />
        Novo Usuário
      </Button>
    </div>
  );
}
