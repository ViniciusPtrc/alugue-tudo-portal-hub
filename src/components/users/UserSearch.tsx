
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

interface UserSearchProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  totalUsers: number;
}

export function UserSearch({ searchQuery, setSearchQuery, totalUsers }: UserSearchProps) {
  return (
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
          {totalUsers} usuários
        </Badge>
      </div>
    </div>
  );
}
