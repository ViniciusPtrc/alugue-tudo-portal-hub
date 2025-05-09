
import { UserAvatar } from "@/components/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  LogOut, 
  MenuIcon, 
  User as UserIcon 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/App";
import { useContext } from "react";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    image?: string;
    role?: string | string[];
  };
  // Add an optional signOut function for cases where useAuth might not be available
  onSignOut?: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  let signOutFn = onSignOut;
  
  try {
    // Try to get the signOut function from useAuth, but don't crash if it's not available
    const authContext = useAuth();
    signOutFn = authContext?.signOut;
  } catch (error) {
    // If useAuth is not available, we'll use the onSignOut prop if provided
    console.warn("AuthContext not available in Header. Using fallback if provided.");
  }
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Alternar menu</span>
          </Button>
        </SidebarTrigger>
      </div>
      
      <div className="flex flex-1 items-center justify-end gap-4">
        <ThemeToggle />
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <UserAvatar user={user} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              {signOutFn && (
                <DropdownMenuItem onClick={signOutFn}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="default" size="sm">
            Entrar
          </Button>
        )}
      </div>
    </header>
  );
}
