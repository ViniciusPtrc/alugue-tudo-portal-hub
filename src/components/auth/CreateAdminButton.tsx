import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateAdminButtonProps {
  onClick: () => void;
  isCreating: boolean;
  isDisabled?: boolean;
}

export function CreateAdminButton({ 
  onClick, 
  isCreating, 
  isDisabled = false 
}: CreateAdminButtonProps) {
  const [isManualCreating, setIsManualCreating] = useState(false);
  
  // Função para criar admin manualmente se o botão principal não funcionar
  const createAdminManually = async () => {
    try {
      setIsManualCreating(true);
      
      // 1. Verificar se já existe um admin
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .contains('role', ['admin'])
        .limit(1);
        
      if (checkError) {
        console.error("Erro ao verificar admins existentes:", checkError);
        toast.error("Erro ao verificar administradores existentes");
        return;
      }
        
      if (existingUsers && existingUsers.length > 0) {
        toast.warning("Já existe pelo menos um administrador no sistema");
        return;
      }
      
      console.log("Criando usuário admin manualmente...");
      
      // 2. Criar o admin
      const { data, error: signUpError } = await supabase.auth.signUp({
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

      if (signUpError) {
        console.error("Erro ao criar admin:", signUpError);
        toast.error("Erro ao criar admin: " + signUpError.message);
        return;
      }
      
      if (!data.user) {
        toast.error("Falha ao criar admin: resposta incompleta");
        return;
      }
      
      console.log("Admin criado com sucesso no auth, ID:", data.user.id);
      
      // Pausa para garantir que a autenticação seja processada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let profileCreated = false;
      
      // 3. Inserir diretamente na tabela users com a nova política RLS
      try {
        console.log("Tentando inserir admin com nova política RLS");
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: 'Administrador',
            email: 'admin@aluguetudo.com',
            role: ['admin'],
            status: 'ativo'
          });
          
        if (!insertError) {
          console.log("Admin criado com sucesso via insert direto");
          profileCreated = true;
        } else {
          console.error("Erro ao inserir admin diretamente:", insertError);
        }
      } catch (insertError) {
        console.error("Exceção ao inserir admin diretamente:", insertError);
      }
      
      // 4. Tentar função create_user_profile atualizada (sem verificação de admin)
      if (!profileCreated) {
        try {
          console.log("Tentando criar admin via create_user_profile atualizada");
          const { error: profileError } = await supabase.rpc('create_user_profile', {
            user_id: data.user.id,
            name: 'Administrador',
            email: 'admin@aluguetudo.com',
            role: ['admin'],
            status: 'ativo'
          });
          
          if (!profileError) {
            console.log("Admin criado com sucesso via RPC");
            profileCreated = true;
          } else {
            console.error("Erro ao criar perfil de admin via RPC:", profileError);
          }
        } catch (profileError) {
          console.error("Exceção ao criar perfil de admin via RPC:", profileError);
        }
      }
      
      // 5. Tentar função create_new_auth_user
      if (!profileCreated) {
        try {
          console.log("Tentando criar admin via create_new_auth_user");
          const { error: newUserError } = await supabase.rpc('create_new_auth_user', {
            email: 'admin@aluguetudo.com',
            password: 'admin123',
            name: 'Administrador',
            role: ['admin'],
            status: 'ativo'
          });
          
          if (!newUserError) {
            console.log("Admin criado com sucesso via create_new_auth_user");
            profileCreated = true;
          } else {
            console.error("Erro ao criar admin via create_new_auth_user:", newUserError);
          }
        } catch (createNewError) {
          console.error("Exceção ao criar admin via create_new_auth_user:", createNewError);
        }
      }
      
      // 6. Verificar uma última vez se o perfil foi criado
      if (!profileCreated) {
        const { data: checkProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (checkProfile) {
          console.log("Perfil de admin existe após verificação final:", checkProfile);
          profileCreated = true;
        }
      }
      
      if (profileCreated) {
        toast.success("Administrador criado com sucesso!");
      } else {
        toast.error("Admin foi criado parcialmente. Contate o suporte.");
      }
      
    } catch (error: any) {
      console.error("Exceção ao criar admin:", error);
      toast.error("Erro ao criar admin: " + error.message);
    } finally {
      setIsManualCreating(false);
    }
  };
  
  return (
    <CardFooter className="flex flex-col space-y-4">
      <div className="text-sm text-muted-foreground text-center w-full">
        Se for o primeiro acesso, use admin@aluguetudo.com e admin123
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onClick}
        disabled={isCreating || isDisabled || isManualCreating}
      >
        {isCreating ? (
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
      
      {isManualCreating && (
        <div className="text-center text-sm text-muted-foreground">
          Criando administrador manualmente...
        </div>
      )}
      
      <div className="text-xs text-muted-foreground text-center">
        <button 
          onClick={createAdminManually} 
          className="text-primary hover:underline"
          disabled={isCreating || isDisabled || isManualCreating}
        >
          Criar admin manualmente
        </button> (use apenas se o método normal falhar)
      </div>
    </CardFooter>
  );
}
