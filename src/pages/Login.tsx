
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { LoginForm } from "@/components/auth/LoginForm";
import { CreateAdminButton } from "@/components/auth/CreateAdminButton";
import { useAdminCreation } from "@/hooks/useAdminCreation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { signIn } = useAuth();
  const { isCreatingAdmin, createAdminUser } = useAdminCreation();

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

  const handleCreateAdmin = () => {
    createAdminUser(email, password);
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

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isDisabled={isCreatingAdmin}
          />

          <CreateAdminButton
            onClick={handleCreateAdmin}
            isCreating={isCreatingAdmin} 
            isDisabled={isLoading}
          />
        </Card>
      </div>
    </div>
  );
}
