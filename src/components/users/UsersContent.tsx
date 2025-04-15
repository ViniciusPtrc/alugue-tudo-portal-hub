
import { UserSearch } from "@/components/users/UserSearch";
import { UserTable } from "@/components/users/UserTable";
import { User } from "@/types/user";

interface UsersContentProps {
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersContent({ 
  users, 
  filteredUsers, 
  isLoading, 
  searchQuery, 
  setSearchQuery, 
  onEditUser, 
  onDeleteUser 
}: UsersContentProps) {
  return (
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
        onEdit={onEditUser}
        onDelete={onDeleteUser}
      />
    </div>
  );
}
