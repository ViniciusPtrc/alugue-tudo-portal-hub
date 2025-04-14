
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext } from "react";

// Páginas
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import TasksPage from "./pages/TasksPage";
import RhPage from "./pages/RhPage";

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
  // Estado para simular autenticação (será substituído pelo Supabase)
  const [user, setUser] = useState<User | null>(null);

  // Simulação de login (será substituído pela autenticação do Supabase)
  const signIn = async (email: string, password: string) => {
    // Simulando verificação de credenciais
    if (email && password) {
      const mockUser: User = {
        id: "1",
        email,
        name: "João Silva",
        role: ["admin", "rh", "financeiro", "comercial", "operacional"],
      };
      setUser(mockUser);
    } else {
      throw new Error("Credenciais inválidas");
    }
  };

  // Simulação de logout
  const signOut = () => {
    setUser(null);
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
