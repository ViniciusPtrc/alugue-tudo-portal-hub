
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";

// Páginas
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import TasksPage from "./pages/TasksPage";
import RhPage from "./pages/RhPage";
import UsersPage from "./pages/UsersPage";

// Componentes
import { AppSidebarWrapper } from "./components/app-sidebar";

const queryClient = new QueryClient();

// Definindo tipos para autenticação
interface User {
  id: string;
  email: string;
  name: string;
  role: string[];
}

// Usuários do sistema
const systemUsers = [
  {
    id: "1",
    email: "admin@aluguetudo.com",
    password: "admin123",
    name: "João Silva",
    role: ["admin", "rh", "financeiro", "comercial", "operacional"],
  },
  {
    id: "2",
    email: "rh@aluguetudo.com",
    password: "rh123",
    name: "Maria Souza",
    role: ["rh"],
  },
  {
    id: "3",
    email: "financeiro@aluguetudo.com",
    password: "financeiro123",
    name: "Pedro Santos",
    role: ["financeiro"],
  },
  {
    id: "4",
    email: "comercial@aluguetudo.com",
    password: "comercial123",
    name: "Ana Oliveira",
    role: ["comercial"],
  },
  {
    id: "5",
    email: "operacional@aluguetudo.com",
    password: "operacional123",
    name: "Carlos Ferreira",
    role: ["operacional"],
  },
];

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

// Criando contexto de autenticação
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// Componente para proteger rotas
interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ element, requiredRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se requerer roles específicas, verifica se o usuário tem permissão
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user.role.some(role => 
      requiredRoles.includes(role) || role === "admin"
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/" />;
    }
  }

  // Se autenticado e com permissões, mostra o conteúdo
  return <AppSidebarWrapper>{element}</AppSidebarWrapper>;
};

const App = () => {
  // Estado para simular autenticação
  const [user, setUser] = useState<User | null>(() => {
    // Verifica se existe um usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Login com verificação de credenciais
  const signIn = async (email: string, password: string) => {
    // Verifica as credenciais com os usuários do sistema
    const foundUser = systemUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      // Salva o usuário no localStorage para persistir o login
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } else {
      throw new Error("Credenciais inválidas");
    }
  };

  // Logout
  const signOut = () => {
    setUser(null);
    // Remove o usuário do localStorage ao fazer logout
    localStorage.removeItem('user');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, signIn, signOut }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota pública */}
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              
              {/* Rotas protegidas */}
              <Route 
                path="/"
                element={<ProtectedRoute element={<Index />} />}
              />
              <Route 
                path="/tarefas"
                element={<ProtectedRoute element={<TasksPage />} />}
              />
              <Route 
                path="/usuarios"
                element={<ProtectedRoute element={<UsersPage />} requiredRoles={["admin"]} />}
              />
              <Route 
                path="/financeiro"
                element={<ProtectedRoute element={<div>Página do Financeiro</div>} requiredRoles={["financeiro"]} />}
              />
              <Route 
                path="/operacional"
                element={<ProtectedRoute element={<div>Página do Operacional</div>} requiredRoles={["operacional"]} />}
              />
              <Route 
                path="/comercial"
                element={<ProtectedRoute element={<div>Página do Comercial</div>} requiredRoles={["comercial"]} />}
              />
              <Route 
                path="/rh"
                element={<ProtectedRoute element={<RhPage />} requiredRoles={["rh"]} />}
              />
              <Route 
                path="/relatorios"
                element={<ProtectedRoute element={<div>Página de Relatórios</div>} requiredRoles={["admin"]} />}
              />
              <Route 
                path="/configuracoes"
                element={<ProtectedRoute element={<div>Página de Configurações</div>} requiredRoles={["admin"]} />}
              />
              
              {/* Rota de fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
