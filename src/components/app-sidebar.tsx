
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CheckSquare,
  CreditCard,
  Headphones,
  Home,
  LayoutDashboard,
  LibraryBig,
  PieChart,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Users,
  UserCog,
  Lock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";

export type SidebarItem = {
  title: string;
  path: string;
  icon: React.ElementType;
  role?: string | string[];
  section?: string;
};

const navItems: SidebarItem[] = [
  {
    title: "Início",
    path: "/",
    icon: Home,
    section: "principal",
  },
  {
    title: "Tarefas Pessoais",
    path: "/tarefas",
    icon: CheckSquare,
    section: "principal",
  },
  {
    title: "Financeiro",
    path: "/financeiro",
    icon: CreditCard,
    section: "setores",
    role: "financeiro",
  },
  {
    title: "Operacional",
    path: "/operacional",
    icon: ShoppingCart,
    section: "setores",
    role: "operacional",
  },
  {
    title: "Comercial",
    path: "/comercial",
    icon: Headphones,
    section: "setores",
    role: "comercial",
  },
  {
    title: "RH",
    path: "/rh",
    icon: Users,
    section: "setores",
    role: "rh",
  },
  {
    title: "Gerenciar Usuários",
    path: "/usuarios",
    icon: UserCog,
    section: "sistema",
    role: "admin",
  },
  {
    title: "Relatórios",
    path: "/relatorios",
    icon: PieChart,
    section: "sistema",
    role: "admin",
  },
  {
    title: "Configurações",
    path: "/configuracoes",
    icon: Settings,
    section: "sistema",
    role: "admin",
  },
];

interface AppSidebarProps {
  className?: string;
  userRole?: string | string[];
}

export function AppSidebar({ className, userRole = [] }: AppSidebarProps) {
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const roles = user?.role || [];
  const isAdmin = roles.includes("admin");

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || "outros";
    if (!acc[section]) {
      acc[section] = [];
    }
    
    const hasPermission = !item.role || 
      isAdmin || 
      (item.role && roles.some(role => 
        Array.isArray(item.role) 
          ? item.role.includes(role) 
          : item.role === role
      ));
    
    if (hasPermission) {
      acc[section].push(item);
    }
    
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  const sectionTitles: Record<string, string> = {
    principal: "PRINCIPAL",
    setores: "SETORES",
    sistema: "SISTEMA",
    outros: "OUTROS",
  };

  if (!mounted) return null;

  return (
    <Sidebar className={cn("border-r", className)}>
      <SidebarHeader className="px-4 py-3">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(groupedItems).map(([section, items]) => (
          items.length > 0 && (
            <SidebarGroup key={section}>
              <SidebarGroupLabel>{sectionTitles[section] || section}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md",
                              isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )
                          }
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                          {item.role === "admin" && <ShieldAlert className="h-3.5 w-3.5 ml-1 text-amber-500" />}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        ))}
      </SidebarContent>
      <SidebarFooter className="px-4 py-3">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={signOut}>Sair</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
