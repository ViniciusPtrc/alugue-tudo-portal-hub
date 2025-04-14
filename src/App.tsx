import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

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

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  const navigate = useNavigate();

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se requerer roles específicas, verifica se o usuário tem permissão
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user.user_metadata?.role || [];
    const hasRequiredRole = userRoles.some(role => 
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Seed admin user if no admin exists
    const seedAdminUser = async () => {
      try {
        // First, check if any admin users exist
        const { data: existingAdmins } = await supabase
          .from('users')
          .select('*')
          .contains('role', ['admin'])
          .limit(1);

        if (existingAdmins && existingAdmins.length === 0) {
          // No admin exists, so sign up the admin user
          const { data, error } = await supabase.auth.signUp({
            email: 'admin@aluguetudo.com',
            password: 'admin123',
            options: {
              data: {
                name: 'Administrador',
                role: ['admin'],
                status: 'ativo'
              }
            }
          });

          if (error) {
            console.error('Error creating admin user:', error);
            toast.error('Erro ao criar usuário admin');
            return;
          }

          if (data.user) {
            toast.success('Usuário admin criado com sucesso');
          }
        }
      } catch (error) {
        console.error('Unexpected error seeding admin:', error);
        toast.error('Erro inesperado ao criar usuário admin');
      }
    };

    // Existing authentication state change logic
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    );

    // Check for existing session and seed admin if needed
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Only try to seed if no user is currently logged in
      if (!currentSession) {
        seedAdminUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login com Supabase
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    setSession(data.session);
    setUser(data.user);
  };

  // Logout com Supabase
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, session, signIn, signOut }}>
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
