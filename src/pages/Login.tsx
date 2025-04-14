
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      
      uiToast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Erro de login:", error);
      uiToast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminUser = async () => {
    if (email !== "admin@aluguetudo.com" || password !== "admin123") {
      uiToast({
        title: "Credenciais inválidas para admin",
        description: "Use admin@aluguetudo.com e admin123 para criar o usuário admin.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAdmin(true);
    try {
      // Verificar se já existe um admin
      const { data: existingAdmins, error: queryError } = await supabase
        .from('users')
        .select('*')
        .contains('role', ['admin'])
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      if (existingAdmins && existingAdmins.length > 0) {
        toast.warning('Já existe um usuário admin no sistema. Tente fazer login normalmente.');
        setIsCreatingAdmin(false);
        return;
      }

      // Criar usuário admin
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
        throw error;
      }

      // Forçar inserção no banco público também
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user?.id,
          email: 'admin@aluguetudo.com',
          name: 'Administrador',
          role: ['admin'],
          status: 'ativo'
        });

      if (insertError) {
        console.warn('Erro ao inserir usuário na tabela pública:', insertError);
      }

      toast.success('Usuário admin criado com sucesso. Agora tente fazer login.');
    } catch (error: any) {
      console.error('Erro ao criar usuário admin:', error);
      toast.error(`Erro ao criar usuário admin: ${error.message}`);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Portal Interno</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@aluguetudo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isCreatingAdmin}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading || isCreatingAdmin}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isCreatingAdmin}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Esconder senha" : "Mostrar senha"}
                    </span>
                  </Button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isCreatingAdmin}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center w-full">
              Se for o primeiro acesso, use admin@aluguetudo.com e admin123
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={createAdminUser}
              disabled={isLoading || isCreatingAdmin}
            >
              {isCreatingAdmin ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Criando...
                </span>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Criar usuário admin
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
