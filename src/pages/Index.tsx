
import { CheckCircle, Clock, ListTodo } from "lucide-react";
import { Header } from "@/components/header";
import { StatCard } from "@/components/stat-card";
import { BirthdayCard, BirthdayPerson } from "@/components/birthday-card";
import { useAuth } from "@/App";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

// Exemplo de dados de aniversariantes
const birthdays: BirthdayPerson[] = [
  {
    id: "1",
    name: "Maria Oliveira",
    birthday: "1990-04-16",
    department: "RH",
    age: 34,
    daysUntil: 2,
    isToday: false,
  },
  {
    id: "2",
    name: "Carlos Santos",
    birthday: "1985-04-14",
    department: "Comercial",
    age: 39,
    daysUntil: 0,
    isToday: true,
  },
  {
    id: "3",
    name: "Ana Luiza",
    birthday: "1992-04-18",
    department: "Financeiro",
    age: 32,
    daysUntil: 4,
    isToday: false,
  },
  {
    id: "4",
    name: "Pedro Henrique",
    birthday: "1988-04-15",
    department: "Operacional",
    age: 36,
    daysUntil: 1,
    isToday: false,
  },
];

const Index = () => {
  const { user } = useAuth();
  const currentUser = {
    name: user?.user_metadata?.name || "Usuário",
    email: user?.email || "",
    role: user?.user_metadata?.role || [],
  };
  
  const roles = Array.isArray(currentUser.role) ? currentUser.role : [currentUser.role];
  const isAdmin = roles.includes("admin");

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={currentUser} />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Olá, {currentUser.name}</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu dashboard. Veja o resumo de suas atividades.
            </p>
          </div>

          {/* Navegação rápida */}
          <div className="my-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/tarefas" className={navigationMenuTriggerStyle()}>
                    Tarefas
                  </Link>
                </NavigationMenuItem>
                
                {isAdmin && (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Administração</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[200px]">
                          <li>
                            <Link 
                              to="/usuarios" 
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium">Usuários</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Gerenciar usuários do sistema
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link 
                              to="/relatorios" 
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium">Relatórios</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Visualizar relatórios do sistema
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link 
                              to="/configuracoes" 
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium">Configurações</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Configurar parâmetros do sistema
                              </p>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </>
                )}
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Setores</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[200px]">
                      <li>
                        <Link 
                          to="/financeiro" 
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">Financeiro</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Gerenciar área financeira
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/operacional" 
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">Operacional</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Gerenciar área operacional
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/comercial" 
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">Comercial</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Gerenciar área comercial
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/rh" 
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium">RH</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Gerenciar recursos humanos
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Tarefas Pendentes"
              value={0}
              icon={Clock}
              iconColor="text-yellow-500"
            />
            <StatCard
              title="Tarefas em Andamento"
              value={0}
              icon={ListTodo}
              iconColor="text-blue-500"
            />
            <StatCard
              title="Tarefas Concluídas"
              value={0}
              icon={CheckCircle}
              iconColor="text-green-500"
            />
          </div>
          
          {/* Barra lateral (1/3) */}
          <div className="space-y-6">
            <BirthdayCard birthdays={birthdays} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
